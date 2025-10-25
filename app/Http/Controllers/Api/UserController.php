<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        // Global search filter
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('roles', function ($qr) use ($search) {
                        $qr->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Column filters
        $filters = $request->input('filter', []);
        foreach ($filters as $field => $value) {
            if ($field === 'roles') {
                $query->whereHas('roles', function ($q) use ($value) {
                    $q->where('name', 'like', "%{$value}%");
                });
            } elseif ($field === 'active') {
                $query->where($field, filter_var($value, FILTER_VALIDATE_BOOLEAN));
            } else {
                $query->where($field, 'like', "%{$value}%");
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'asc');
        if ($sortBy === 'roles') {
            // Skip sorting or handle specially if needed; for now, fallback to id
            $sortBy = 'id';
        }
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        // For registration; could be public or protected
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'active' => 'sometimes|boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'active' => $request->boolean('active', true),
        ]);
        $token = $user->createToken('erp-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function show($id)
    {
        $user = User::with('roles.permissions')->findOrFail($id);
        // Check if auth user can view (e.g., self or admin)
        if (auth()->id() !== $user->id && !auth()->user()->hasPermission('view_users')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        // Only self or admin can update
        if (auth()->id() !== $user->id && !auth()->user()->hasPermission('edit_users')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:8|confirmed',
            'active' => 'sometimes|boolean',
        ]);

        $data = $request->except('password');
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json($user);
    }

    public function destroy($id)
    {
        // Admin-only; add middleware 'permission:delete_users'
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(null, 204);
    }

    // Assign role to user
    public function assignRole(Request $request, $id)
    {
        $request->validate(['role_id' => 'required|exists:roles,id']);
        $user = User::findOrFail($id);
        // Check permission
        if (!auth()->user()->hasPermission('assign_roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $user->roles()->syncWithoutDetaching([$request->role_id]);
        return response()->json(['message' => 'Role assigned']);
    }

    // Remove role from user
    public function removeRole(Request $request, $id)
    {
        $request->validate(['role_id' => 'required|exists:roles,id']);
        $user = User::findOrFail($id);
        if (!auth()->user()->hasPermission('assign_roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $user->roles()->detach($request->role_id);
        return response()->json(['message' => 'Role removed']);
    }
}
