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
        $query = Auth::user()->todos()->with(['category', 'priority']);

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        $query->orderBy('position', 'asc');

        $perPage = $request->input('per_page', 10);
        $todos = $query->paginate($perPage);

        return response()->json($todos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string',
            'completed'    => 'boolean',
            'category_id'  => 'nullable|exists:categories,id',
            'due_date'     => 'nullable|date',
            'priority_id'  => 'nullable|exists:priorities,id',
            'position'     => 'integer|min:0',
            'active'       => 'boolean',
        ]);

        $todo = Auth::user()->todos()->create($validated);

        return response()->json(['data' => $todo->load(['category', 'priority'])], 201);
    }

    public function show($id)
    {
        $todo = Auth::user()->todos()->with(['category', 'priority'])->findOrFail($id);
        return response()->json(['data' => $todo]);
    }

    public function update(Request $request, $id)
    {
        $todo = Auth::user()->todos()->findOrFail($id);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string',
            'completed'   => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'due_date'    => 'nullable|date',
            'priority_id' => 'nullable|exists:priorities,id',
            'active'      => 'boolean',
        ]);

        $todo->update($validated);

        return response()->json(['data' => $todo->load(['category', 'priority'])]);
    }

    public function destroy($id)
    {
        $todo = Auth::user()->todos()->findOrFail($id);
        $todo->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:todos,id',
        ]);

        $userTodoIds = Auth::user()->todos()->pluck('id')->toArray();

        if (array_diff($validated['ordered_ids'], $userTodoIds)) {
            return response()->json(['error' => 'Invalid todo IDs'], 400);
        }

        foreach ($validated['ordered_ids'] as $index => $id) {
            Todo::where('id', $id)->update(['position' => $index]);
        }

        return response()->json(['message' => 'Todos reordered successfully']);
    }
}
