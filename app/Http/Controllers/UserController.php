<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    use AuthorizesRequests;

//    public function __construct()
//    {
//        // Policy: App\Policies\UserPolicy (user.list, user.read, …)
//        $this->authorizeResource(User::class, 'user');
//    }

    /* ----------------------------------------------------------------
     *  INDEX – list with search & pagination
     * ---------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $perPage = (int) $request->input('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100, 200]) ? $perPage : 25;

        $users = User::with('roles')
            ->active()
            ->when($request->filled('search'), fn ($q) => $q
                ->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->filled('role'), fn ($q) => $q->whereHas('roles', fn ($rq) => $rq->where('name', $request->role)))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $roles = Role::select('name', 'label')->orderBy('label')->get();

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role', 'per_page']),
            'roles'   => $roles,
            'can'     => [
                'create' => Gate::allows('create', User::class),
                'delete' => Gate::allows('delete', User::class),
            ],
            'trashedCount' => User::onlyTrashed()->count(),
        ]);
    }

    /* ----------------------------------------------------------------
     *  CREATE – form
     * ---------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', User::class);

        $roles = Role::select('id', 'name', 'label')->orderBy('label')->get();

        return Inertia::render('Users/Create', [
            'roles' => $roles,
        ]);
    }

    /* ----------------------------------------------------------------
     *  STORE – validation + persist
     * ---------------------------------------------------------------- */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'active'   => 'sometimes|boolean',
            'roles'    => 'sometimes|array',
            'roles.*'  => 'exists:roles,name',
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['active']   = $request->boolean('active', true);

        $user = User::create($data);

        if ($request->filled('roles')) {
            $user->assignRole(...$request->roles);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /* ----------------------------------------------------------------
     *  SHOW – optional detail page
     * ---------------------------------------------------------------- */
    public function show(User $user)
    {
        $this->authorize('view', $user);
        $user->load('roles');

        return Inertia::render('Users/Show', compact('user'));
    }

    /* ----------------------------------------------------------------
     *  EDIT – form
     * ---------------------------------------------------------------- */
    public function edit(User $user)
    {
        $this->authorize('update', $user);
        $user->load('roles');

        $roles = Role::select('id', 'name', 'label')->orderBy('label')->get();

        return Inertia::render('Users/Edit', [
            'user'  => $user,
            'roles' => $roles,
        ]);
    }

    /* ----------------------------------------------------------------
     *  UPDATE
     * ---------------------------------------------------------------- */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'active'   => 'sometimes|boolean',
            'roles'    => 'sometimes|array',
            'roles.*'  => 'exists:roles,name',
        ]);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        if ($request->has('roles')) {
            $roleIds = Role::whereIn('name', $request->roles)->pluck('id');
            $user->roles()->sync($roleIds);
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /* ----------------------------------------------------------------
     *  DESTROY – soft-delete
     * ---------------------------------------------------------------- */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();

        return back()->with('success', 'User moved to trash.');
    }

    /* ----------------------------------------------------------------
     *  TRASH – list deleted users
     * ---------------------------------------------------------------- */
    public function trash()
    {
        $this->authorize('viewAny', User::class); // reuse list permission

        $users = User::onlyTrashed()
            ->with('roles')
            ->orderByDesc('deleted_at')
            ->paginate(25);

        return Inertia::render('Users/Trash', ['users' => $users]);
    }

    /* ----------------------------------------------------------------
     *  RESTORE – from trash
     * ---------------------------------------------------------------- */
    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->authorize('restore', $user);
        $user->restore();

        return back()->with('success', 'User restored.');
    }

    /* ----------------------------------------------------------------
     *  FORCE DELETE – permanent removal
     * ---------------------------------------------------------------- */
    public function forceDelete($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->authorize('delete', $user);
        $user->forceDelete();

        return back()->with('success', 'User permanently deleted.');
    }
}
