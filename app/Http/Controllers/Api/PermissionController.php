<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::with('roles');

        // Search
        $search = $request->input('search');
        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        // Filter by role
        $role = $request->input('filter.role');
        if ($role) {
            $query->whereHas('roles', fn($q) => $q->where('name', 'like', "%{$role}%"));
        }

        $perPage = $request->input('per_page', 10);
        $permissions = $query->paginate($perPage);

        return response()->json([
            'data' => PermissionResource::collection($permissions->items()),
            'meta' => [
                'current_page' => $permissions->currentPage(),
                'last_page' => $permissions->lastPage(),
                'per_page' => $permissions->perPage(),
                'total' => $permissions->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|unique:permissions,name',
            'description' => 'nullable|string'
        ]);

        $permission = Permission::create($request->only('name', 'description'));
        return new PermissionResource($permission);
    }

    public function show($id)
    {
        $permission = Permission::with('roles')->findOrFail($id);
        return new PermissionResource($permission);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $permission = Permission::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|unique:permissions,name,' . $id,
            'description' => 'nullable|string'
        ]);

        $permission->update($request->only('name', 'description'));
        return new PermissionResource($permission);
    }

    public function destroy($id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $permission = Permission::findOrFail($id);
        $permission->delete();
        return response()->json(null, 204);
    }

    public function assignRole(Request $request, $id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['role_id' => 'required|exists:roles,id']);
        $permission = Permission::findOrFail($id);
        $permission->roles()->syncWithoutDetaching([$request->role_id]);

        return response()->json(['message' => 'Role assigned to permission']);
    }

    public function removeRole(Request $request, $id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['role_id' => 'required|exists:roles,id']);
        $permission = Permission::findOrFail($id);
        $permission->roles()->detach($request->role_id);

        return response()->json(['message' => 'Role removed from permission']);
    }
}
