<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $query = Auth::user()->todos()->with(['category', 'priority']);  // Eager load relationships

        // Filtering examples
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('priority_id')) {
            $query->where('priority_id', $request->priority_id);
        }
        if ($request->has('active')) {
            $query->where('active', $request->active);
        }

        // Sorting with position support
        $sortBy = $request->query('sort_by', 'position');
        $sortDir = $request->query('sort_dir', 'asc');  // asc for position ordering
        $query->orderBy($sortBy, $sortDir);

        $perPage = $request->query('per_page', 10);
        $todos = $query->paginate($perPage);

        return response()->json($todos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'priority_id' => 'nullable|exists:priorities,id',
            'active' => 'boolean',
            'position' => 'integer|min:0',
        ]);

        $todo = Auth::user()->todos()->create($request->all());
        return response()->json($todo->load(['category', 'priority']), 201);
    }

    public function show($id)
    {
        $todo = Auth::user()->todos()->with(['category', 'priority'])->findOrFail($id);
        return response()->json($todo);
    }

    public function update(Request $request, $id)
    {
        $todo = Auth::user()->todos()->findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'priority_id' => 'nullable|exists:priorities,id',
            'active' => 'boolean',
            'position' => 'integer|min:0',
        ]);

        $todo->update($request->all());
        return response()->json($todo->load(['category', 'priority']));
    }

    public function destroy($id)
    {
        $todo = Auth::user()->todos()->findOrFail($id);
        $todo->delete();
        return response()->json(null, 204);
    }

    // New method for reordering todos (e.g., via drag-and-drop in frontend)
    public function reorder(Request $request)
    {
        $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:todos,id',
        ]);

        $userTodos = Auth::user()->todos()->pluck('id')->toArray();
        $orderedIds = $request->ordered_ids;

        // Ensure only user's todos are reordered
        if (array_diff($orderedIds, $userTodos)) {
            return response()->json(['error' => 'Invalid todo IDs'], 400);
        }

        foreach ($orderedIds as $position => $id) {
            Todo::where('id', $id)->update(['position' => $position]);
        }

        return response()->json(['message' => 'Todos reordered']);
    }
}
