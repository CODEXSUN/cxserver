<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        // Global search
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('roles', fn($qr) => $qr->where('name', 'like', "%{$search}%"));
            });
        }

        // Filters
        $filters = $request->input('filter', []);
        foreach ($filters as $field => $value) {
            if ($field === 'roles') {
                $query->whereHas('roles', fn($q) => $q->where('name', 'like', "%{$value}%"));
            } elseif ($field === 'active') {
                $query->where($field, filter_var($value, FILTER_VALIDATE_BOOLEAN));
            } else {
                $query->where($field, 'like', "%{$value}%");
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortBy === 'roles' ? 'id' : $sortBy, $sortDir);

        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        return response()->json([
            'data' => UserResource::collection($users->items()),
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
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);

        if (auth()->id() !== $user->id && !auth()->user()->hasPermissionTo('view users')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return new UserResource($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() !== $user->id && !auth()->user()->hasPermissionTo('update users')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:8|confirmed',
            'active' => 'sometimes|boolean',
        ]);

        $data = $request->except('password');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return new UserResource($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if (!auth()->user()->hasPermissionTo('delete users')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->delete();
        return response()->json(null, 204);
    }

    public function assignRole(Request $request, $id)
    {
        $request->validate(['role_id' => 'required|exists:roles,id']);
        $user = User::findOrFail($id);

        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->roles()->syncWithoutDetaching([$request->role_id]);
        return response()->json(['message' => 'Role assigned']);
    }

    public function removeRole(Request $request, $id)
    {
        $request->validate(['role_id' => 'required|exists:roles,id']);
        $user = User::findOrFail($id);

        if (!auth()->user()->hasPermissionTo('manage roles')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->roles()->detach($request->role_id);
        return response()->json(['message' => 'Role removed']);
    }
}
