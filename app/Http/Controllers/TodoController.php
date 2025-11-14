<?php


namespace App\Http\Controllers;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TodoController extends Controller
{
    use AuthorizesRequests;

    /** --------------------------------------------------------------
     *  INDEX – list with search & pagination
     *  -------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Todo::class);

        $perPage = (int)$request->input('per_page', 100);
        $perPage = in_array($perPage, [10, 25, 50, 100, 200]) ? $perPage : 100;

        $query = Todo::with(['user', 'assignee'])
            ->select('todos.*')
            ->when($request->filled('search'), fn($q) => $q->where(function ($q) use ($request) {
                $search = $request->search;
                $q->where('title', 'like', "%{$search}%");
            }))
            ->when($request->filled('my_tasks'), fn($q) => $q->where(function ($q) {
                $q->where('user_id', auth()->id())
                    ->orWhere('assignee_id', auth()->id());
            }))
            ->when($request->completed === 'yes', fn($q) => $q->where('completed', true))
            ->when($request->completed === 'no', fn($q) => $q->where('completed', false))
            ->when($request->visibility && $request->visibility !== 'all', fn($q) => $q->where('visibility', $request->visibility))
            ->when($request->priority && $request->priority !== 'all', fn($q) => $q->where('priority', $request->priority))
            ->when($request->filled('assignee_id'), fn($q) => $q->where('assignee_id', $request->assignee_id))
            ->when($request->filled('due_from'), fn($q) => $q->whereDate('due_date', '>=', $request->due_from))
            ->when($request->filled('due_to'), fn($q) => $q->whereDate('due_date', '<=', $request->due_to));

        $todos = $query
            ->orderBy('position')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Todos/Index', [
            'todos' => $todos,
            'filters' => $request->only(['search', 'completed', 'visibility', 'priority', 'assignee_id', 'my_tasks', 'due_from', 'due_to', 'per_page']),
            'can' => [
                'create' => Gate::allows('create', Todo::class),
                'delete' => Gate::allows('delete', Todo::class),
            ],
            'trashedCount' => Todo::onlyTrashed()->count(),
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /** --------------------------------------------------------------
     *  CREATE – form
     *  -------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', Todo::class);

        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Todos/Create', [
            'users' => $users
        ]);
    }

    /** --------------------------------------------------------------
     *  STORE – validation + persist
     *  -------------------------------------------------------------- */
    public function store(Request $request)
    {
        $this->authorize('create', Todo::class);

        $data = $request->validate([
            'title' => 'required|string',
            'assignee_id' => 'nullable|exists:users,id',
            'visibility' => 'required|in:personal,work,public',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
        ]);

        $data['user_id'] = auth()->id();

        // Insert at top: position = 0, then shift others down
        Todo::where('position', '>=', 0)->increment('position');
        $data['position'] = 0;

        Todo::create($data);

        return redirect()->route('todos.index')->with('success', 'Todo created.');
    }

    public function reorder(Request $request)
    {
        $order = $request->input('order', []); // array of todo IDs in new order
        foreach ($order as $index => $id) {
            Todo::where('id', $id)->update(['position' => $index]);
        }

        return back();
//        return response()->json(['message' => 'Order updated']);
//        $this->index($request);
    }

    /** --------------------------------------------------------------
     *  SHOW – details page
     *  -------------------------------------------------------------- */
    public function show(Todo $todo)
    {
        $this->authorize('view', $todo);

        return Inertia::render('Todos/Show', [
            'todo' => $todo->load(['user', 'assignee']),
            'can' => [
                'edit' => Gate::allows('update', $todo),
                'delete' => Gate::allows('delete', $todo),
            ],
        ]);
    }

    /** --------------------------------------------------------------
     *  EDIT – form
     *  -------------------------------------------------------------- */
    public function edit(Todo $todo)
    {
        $this->authorize('update', $todo);

        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Todos/Edit', [
            'todo' => $todo,
            'users' => $users,
        ]);
    }

    /** --------------------------------------------------------------
     *  UPDATE – validation + persist
     *  -------------------------------------------------------------- */
    public function update(Request $request, Todo $todo)
    {

        $this->authorize('update', $todo);

        $data = $request->validate([
            'title' => 'required|string',
            'position' => 'nullable|integer|min:0',
            'assignee_id' => 'nullable|exists:users,id',
            'visibility' => 'required|in:personal,work,public',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
            'completed' => 'boolean',
        ]);

        $todo->update($data);

//        return redirect()->route('todos.index')
//            ->with('success', 'Todo updated.');

        return back();

//        return response()->json(['message' => 'Todo updated']);
    }

    /** --------------------------------------------------------------
     *  DESTROY – soft-delete
     *  -------------------------------------------------------------- */
    public function destroy(Todo $todo)
    {
        $this->authorize('delete', $todo);
        $todo->delete();

        return redirect()->route('todos.index')
            ->with('success', 'Todo moved to trash.');
    }

    /** --------------------------------------------------------------
     *  RESTORE – from trash
     *  -------------------------------------------------------------- */
    public function restore($id)
    {
        $todo = Todo::withTrashed()->findOrFail($id);
        $this->authorize('restore', $todo);
        $todo->restore();

        return redirect()->route('todos.index')
            ->with('success', 'Todo restored.');
    }

    /** --------------------------------------------------------------
     *  TRASH – list deleted records
     *  -------------------------------------------------------------- */
    public function trash()
    {
        $this->authorize('viewAny', Todo::class);

        $todos = Todo::onlyTrashed()
            ->with(['user', 'assignee'])
            ->paginate(10);

        return Inertia::render('Todos/Trash', ['todos' => $todos]);
    }

    /** --------------------------------------------------------------
     *  FORCE DELETE – permanent removal
     *  -------------------------------------------------------------- */
    public function forceDelete($id)
    {
        $todo = Todo::withTrashed()->findOrFail($id);
        $this->authorize('delete', $todo);
        $todo->forceDelete();

        return redirect()->route('todos.index')
            ->with('success', 'Todo permanently deleted.');
    }

    /**
     * Return the next position (e.g., max(position) + 1)
     */
    public function nextPosition(Request $request)
    {
        $maxPosition = Todo::max('position');
        $nextPosition = $maxPosition ? $maxPosition + 1 : 1;

        return inertia()->render('Todos/Create', [
            'nextPosition' => $nextPosition,
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function search(Request $request)
    {
        $q = $request->query('q', '');
        if (strlen($q) < 2) {
            return response()->json(['todos' => []]);
        }

        $todos = Todo::with('assignee')
            ->where('completed', false)
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%");
            })
            ->limit(10)
            ->get(['id', 'title', 'priority', 'assignee_id']);

        return response()->json(['todos' => $todos]);
    }


    public function toggleComplete(Todo $todo, Request $request)
    {
        $todo->update(['completed' => ! $todo->completed]);
        return back();
    }
}
