<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

class Role extends Model
{
    use HasFactory;

    /** @var string */
    protected $table = 'roles';

    /** @var array<int, string> */
    protected $fillable = [
        'name',
        'guard_name',
        'description',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    /**
     * Users that belong to this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    /**
     * Permissions assigned to this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    /**
     * Assign one or more permissions to the role.
     *
     * @param  mixed  ...$permissions  Permission name(s) or model(s)
     * @return static
     */
    public function givePermissionTo(...$permissions): static
    {
        $permissions = $this->resolvePermissions($permissions);
        if ($permissions->isEmpty()) {
            return $this;
        }

        $this->permissions()->syncWithoutDetaching($permissions->pluck('id')->all());
        return $this;
    }

    /**
     * Sync permissions (replace all).
     *
     * @param  mixed  ...$permissions
     * @return static
     */
    public function syncPermissions(...$permissions): static
    {
        $ids = collect($permissions)->flatten()->map(function ($perm) {
            return $perm instanceof Permission ? $perm->id : Permission::where('name', $perm)->first()?->id;
        })->filter()->all();

        $this->permissions()->sync($ids);
        return $this;
    }

    /**
     * Resolve permission names/models to Eloquent models.
     *
     * @param  mixed  $permissions
     * @return Collection<int, Permission>
     */
    protected function resolvePermissions($permissions): Collection
    {
        return collect($permissions)->flatten()->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission;
            }

            if (is_string($permission)) {
                $permission = trim($permission);

                return Permission::where('name', $permission)
                    ->where('guard_name', $this->guard_name ?? 'web')
                    ->first();
            }

            return null;
        })->filter();
    }

    /**
     * Check if role has a permission (via pivot).
     */
    public function hasPermissionTo(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }
}
