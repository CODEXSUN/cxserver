<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Priority;
use Illuminate\Http\Request;

class PriorityController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $priorities = Priority::orderBy('level', 'asc')->paginate($perPage);  // Order by level for logical display
        return response()->json($priorities);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:priorities',
            'level' => 'required|integer|unique:priorities',
            'description' => 'nullable|string',
        ]);

        $priority = Priority::create($request->all());
        return response()->json($priority, 201);
    }

    public function show($id)
    {
        $priority = Priority::findOrFail($id);
        return response()->json($priority);
    }

    public function update(Request $request, $id)
    {
        $priority = Priority::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:priorities,name,' . $id,
            'level' => 'sometimes|required|integer|unique:priorities,level,' . $id,
            'description' => 'nullable|string',
        ]);

        $priority->update($request->all());
        return response()->json($priority);
    }

    public function destroy($id)
    {
        $priority = Priority::findOrFail($id);
        $priority->delete();
        return response()->json(null, 204);
    }
}
