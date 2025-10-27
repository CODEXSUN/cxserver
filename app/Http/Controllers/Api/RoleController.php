<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::with('permissions');

        // Search
        $search = $request->input('search');
        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        // Filter by permission
        $perm = $request->input('filter.permission');
        if ($perm) {
            $query->whereHas('permissions', fn($q) => $q->where('name', 'like', "%{$perm}%"));
        }

        $perPage = $request->input('per_page', 10);
        $roles = $query->paginate($perPage);

        return response()->json([
            'data' => RoleResource::collection($roles->items()),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string'
        ]);

        $role = Role::create($request->only('name', 'description'));
        return new RoleResource($role);
    }

    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        return new RoleResource($role);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $role = Role::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|unique:roles,name,' . $id,
            'description' => 'nullable|string'
        ]);

        $role->update($request->only('name', 'description'));
        return new RoleResource($role);
    }

    public function destroy($id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(null, 204);
    }

    public function assignPermission(Request $request, $id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['permission_id' => 'required|exists:permissions,id']);
        $role = Role::findOrFail($id);
        $role->permissions()->syncWithoutDetaching([$request->permission_id]);

        return response()->json(['message' => 'Permission assigned']);
    }

    public function removePermission(Request $request, $id)
    {
        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['permission_id' => 'required|exists:permissions,id']);
        $role = Role::findOrFail($id);
        $role->permissions()->detach($request->permission_id);

        return response()->json(['message' => 'Permission removed']);
    }
}
