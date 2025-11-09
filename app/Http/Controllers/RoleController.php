<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class RoleController extends Controller
{
    use AuthorizesRequests;

    /* ----------------------------------------------------------------
     *  INDEX – list with search & pagination
     * ---------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Role::class);

        $perPage = $request->input('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 25;

        $roles = Role::with('permissions')
            ->when($request->filled('search'), fn($q) => $q
                ->where('name', 'like', "%{$request->search}%")
                ->orWhere('label', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%")
            )
            ->orderBy('label')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Roles/Index', [
            'roles'        => $roles,
            'filters'      => $request->only(['search', 'per_page']),
            'can'          => [
                'create' => Gate::allows('create', Role::class),
                'delete' => Gate::allows('delete', Role::class),
            ],
            'trashedCount' => Role::onlyTrashed()->count(),
        ]);
    }

    /* ----------------------------------------------------------------
     *  SHOW – single role details
     * ---------------------------------------------------------------- */
    public function show(Role $role)
    {
        $this->authorize('view', $role);

        $role->load('permissions', 'users');

        return Inertia::render('Roles/Show', [
            'role' => $role,
            'can'  => [
                'edit'   => Gate::allows('update', $role),
                'delete' => Gate::allows('delete', $role),
            ],
        ]);
    }

    /* ----------------------------------------------------------------
     *  CREATE – form
     * ---------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', Role::class);

        $permissions = Permission::orderBy('label')->get();

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /* ----------------------------------------------------------------
     *  STORE – validation + persist
     * ---------------------------------------------------------------- */
    public function store(Request $request)
    {
        $this->authorize('create', Role::class);

        $data = $request->validate([
            'name'        => 'required|string|unique:roles,name|max:50',
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create($data);

        if ($request->filled('permissions')) {
            $role->permissions()->attach($request->permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /* ----------------------------------------------------------------
     *  EDIT – form
     * ---------------------------------------------------------------- */
    public function edit(Role $role)
    {
        $this->authorize('update', $role);

        $role->load('permissions');
        $permissions = Permission::orderBy('label')->get();

        return Inertia::render('Roles/Edit', [
            'role'        => $role,
            'permissions' => $permissions,
        ]);
    }

    /* ----------------------------------------------------------------
     *  UPDATE – validation + sync
     * ---------------------------------------------------------------- */
    public function update(Request $request, Role $role)
    {
        $this->authorize('update', $role);

        $data = $request->validate([
            'name'        => 'sometimes|string|unique:roles,name,' . $role->id . '|max:50',
            'label'       => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update($data);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /* ----------------------------------------------------------------
     *  DESTROY – soft-delete
     * ---------------------------------------------------------------- */
    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        if ($role->users()->exists()) {
            return back()->withErrors(['delete' => 'Cannot delete role assigned to users.']);
        }

        $role->permissions()->detach();
        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role moved to trash.');
    }

    /* ----------------------------------------------------------------
     *  TRASH – list deleted roles
     * ---------------------------------------------------------------- */
    public function trash()
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::onlyTrashed()
            ->with('permissions')
            ->orderByDesc('deleted_at')
            ->paginate(25);

        return Inertia::render('Roles/Trash', ['roles' => $roles]);
    }

    /* ----------------------------------------------------------------
     *  RESTORE – from trash
     * ---------------------------------------------------------------- */
    public function restore($id)
    {
        $role = Role::withTrashed()->findOrFail($id);
        $this->authorize('restore', $role);
        $role->restore();

        return back()->with('success', 'Role restored.');
    }

    /* ----------------------------------------------------------------
     *  FORCE DELETE – permanent removal
     * ---------------------------------------------------------------- */
    public function forceDelete($id)
    {
        $role = Role::withTrashed()->findOrFail($id);
        $this->authorize('delete', $role);

        $role->permissions()->detach();
        $role->forceDelete();

        return redirect()->route('roles.index')
            ->with('success', 'Role permanently deleted.');
    }
}
