<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PermissionController extends Controller
{
    use AuthorizesRequests;

    /* ----------------------------------------------------------------
     *  INDEX – list with search & pagination
     * ---------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Permission::class);

        $perPage = $request->input('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 25;

        $permissions = Permission::with('roles') // ← ADD THIS
        ->when($request->filled('search'), fn($q) => $q
            ->where('name', 'like', "%{$request->search}%")
            ->orWhere('label', 'like', "%{$request->search}%")
            ->orWhere('description', 'like', "%{$request->search}%")
        )
            ->orderBy('label')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Permissions/Index', [
            'permissions'  => $permissions,
            'filters'      => $request->only(['search', 'per_page']),
            'can'          => [
                'create' => Gate::allows('create', Permission::class),
                'delete' => Gate::allows('delete', Permission::class),
            ],
            'trashedCount' => Permission::onlyTrashed()->count(),
        ]);
    }

    /* ----------------------------------------------------------------
     *  SHOW – single permission details
     * ---------------------------------------------------------------- */
    public function show(Permission $permission)
    {
        $this->authorize('view', $permission);

        $permission->load('roles'); // ← ADD THIS

        return Inertia::render('Permissions/Show', [
            'permission' => $permission,
            'can'        => [
                'edit'   => Gate::allows('update', $permission),
                'delete' => Gate::allows('delete', $permission),
            ],
        ]);
    }

    /* ----------------------------------------------------------------
     *  CREATE – form
     * ---------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', Permission::class);

        return Inertia::render('Permissions/Create');
    }

    /* ----------------------------------------------------------------
     *  STORE – validation + persist
     * ---------------------------------------------------------------- */
    public function store(Request $request)
    {
        $this->authorize('create', Permission::class);

        $data = $request->validate([
            'name'        => 'required|string|unique:permissions,name|max:100',
            'label'       => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        Permission::create($data);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission created.');
    }

    /* ----------------------------------------------------------------
     *  EDIT – form
     * ---------------------------------------------------------------- */
    public function edit(Permission $permission)
    {
        $this->authorize('update', $permission);

        return Inertia::render('Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    /* ----------------------------------------------------------------
     *  UPDATE – validation + update
     * ---------------------------------------------------------------- */
    public function update(Request $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $data = $request->validate([
            'name'        => 'sometimes|string|unique:permissions,name,' . $permission->id . '|max:100',
            'label'       => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        $permission->update($data);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission updated.');
    }

    /* ----------------------------------------------------------------
     *  DESTROY – soft-delete
     * ---------------------------------------------------------------- */
    public function destroy(Permission $permission)
    {
        $this->authorize('delete', $permission);

        if ($permission->roles()->exists()) {
            return back()->withErrors(['delete' => 'Cannot delete permission assigned to roles.']);
        }

        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission moved to trash.');
    }

    /* ----------------------------------------------------------------
     *  TRASH – list deleted permissions
     * ---------------------------------------------------------------- */
    public function trash()
    {
        $this->authorize('viewAny', Permission::class);

        $permissions = Permission::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->paginate(25);

        return Inertia::render('Permissions/Trash', ['permissions' => $permissions]);
    }

    /* ----------------------------------------------------------------
     *  RESTORE – from trash
     * ---------------------------------------------------------------- */
    public function restore($id)
    {
        $permission = Permission::withTrashed()->findOrFail($id);
        $this->authorize('restore', $permission);
        $permission->restore();

        return back()->with('success', 'Permission restored.');
    }

    /* ----------------------------------------------------------------
     *  FORCE DELETE – permanent removal
     * ---------------------------------------------------------------- */
    public function forceDelete($id)
    {
        $permission = Permission::withTrashed()->findOrFail($id);
        $this->authorize('delete', $permission);
        $permission->forceDelete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission permanently deleted.');
    }
}
