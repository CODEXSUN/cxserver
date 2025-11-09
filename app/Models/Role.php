<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;

class Role extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = 'roles';

    protected $fillable = [
        'name',
        'label',
        'guard_name',
        'description',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    public function givePermissionTo(...$permissions): static
    {
        $permissions = $this->resolvePermissions($permissions);
        if ($permissions->isEmpty()) {
            return $this;
        }

        $this->permissions()->syncWithoutDetaching($permissions->pluck('id')->all());
        return $this;
    }

    public function revokePermissionFrom($permissionIds): void
    {
        $this->permissions()->detach($permissionIds);
    }

    public function syncPermissions(...$permissions): static
    {
        $ids = collect($permissions)->flatten()->map(function ($perm) {
            return $perm instanceof Permission ? $perm->id : Permission::where('name', $perm)->first()?->id;
        })->filter()->all();

        $this->permissions()->sync($ids);
        return $this;
    }

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

    public function hasPermissionTo(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }
}
