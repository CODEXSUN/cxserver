<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UserController extends Controller
{
    use AuthorizesRequests;

    protected $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /* ----------------------------------------------------------------
     *  INDEX
     * ---------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $perPage = (int)$request->input('per_page', 25);
        $perPage = in_array($perPage, [10, 25, 50, 100, 200]) ? $perPage : 25;

        $users = User::with('roles')
            ->active()
            ->when($request->filled('search'), fn($q) => $q
                ->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->filled('role'), fn($q) => $q->whereHas('roles', fn($rq) => $rq->where('name', $request->role)))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $roles = Role::select('name', 'label')->orderBy('label')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'per_page']),
            'roles' => $roles,
            'can' => [
                'create' => Gate::allows('create', User::class),
                'delete' => Gate::allows('delete', User::class),
            ],
            'trashedCount' => User::onlyTrashed()->count(),
        ]);
    }

    /* ----------------------------------------------------------------
     *  CREATE
     * ---------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', User::class);
        $roles = Role::select('id', 'name', 'label')->orderBy('label')->get();
        return Inertia::render('Users/Create', ['roles' => $roles]);
    }

    /* ----------------------------------------------------------------
     *  STORE
     * ---------------------------------------------------------------- */
    public function store(Request $request)
    {
//        dd($request);

        $this->authorize('create', User::class);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'active' => 'sometimes|boolean',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,name',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo_path'] = $this->resizeAndStore($request->file('profile_photo'));
        }

        $data['password'] = Hash::make($data['password']);
        $data['active'] = $request->boolean('active', true);

        $user = User::create($data);

        if ($request->has('roles')) {
            $roleIds = Role::whereIn('name', $request->input('roles', []))->pluck('id');
            $user->roles()->sync($roleIds);
        }

        return redirect()->route('users.index')->with('success', 'User created.');
    }

    /* ----------------------------------------------------------------
     *  SHOW
     * ---------------------------------------------------------------- */
    public function show(User $user)
    {
        $this->authorize('view', $user);
        $user->load('roles');

        return Inertia::render('Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'active' => $user->active,
                'roles' => $user->roles->pluck('label', 'name'),
                'profile_photo_url' => $user->profile_photo_url,
                'default_profile_photo_url' => $user->default_profile_photo_url,
                'created_at' => $user->created_at->format('M d, Y'),
            ],
        ]);
    }

    /* ----------------------------------------------------------------
     *  EDIT
     * ---------------------------------------------------------------- */
    public function edit(User $user)
    {
        $this->authorize('update', $user);
        $user->load('roles');

        $roles = Role::select('id', 'name', 'label')->orderBy('label')->get();

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'active' => $user->active,
                'roles' => $user->roles->pluck('name')->toArray(),
                'profile_photo_url' => $user->profile_photo_url,
                'default_profile_photo_url' => $user->default_profile_photo_url,
            ],
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
            'password' => 'nullable|string|min:8|confirmed',
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
     *  RESIZE & STORE (NO CROP)
     * ---------------------------------------------------------------- */
    protected function resizeAndStore($file): string
    {
        $image = $this->manager->read($file);
        $image->resize(300, 300, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        $path = 'profile-photos/' . \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
        Storage::disk('public')->put($path, (string)$image->encode());

        return $path;
    }

    /* ----------------------------------------------------------------
     *  DESTROY / TRASH / RESTORE / FORCE DELETE
     * ---------------------------------------------------------------- */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();
        return back()->with('success', 'User moved to trash.');
    }

    public function trash()
    {
        $this->authorize('viewAny', User::class);
        $users = User::onlyTrashed()->with('roles')->orderByDesc('deleted_at')->paginate(25);
        return Inertia::render('Users/Trash', ['users' => $users]);
    }

    public function restore($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->authorize('restore', $user);
        $user->restore();
        return back()->with('success', 'User restored.');
    }

    public function forceDelete($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->authorize('delete', $user);
        $user->forceDelete();
        return back()->with('success', 'User permanently deleted.');
    }
}
