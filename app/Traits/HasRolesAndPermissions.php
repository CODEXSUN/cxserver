<?php


namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;

trait HasRolesAndPermissions
{
    // Roles
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function hasRole($role): bool
    {
        if (is_string($role)) {
            return $this->roles->contains('name', $role);
        }
        return $this->roles->contains($role);
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    // Permissions (via roles)
    public function getAllPermissions(): \Illuminate\Support\Collection
    {
        return Permission::whereHas('roles', fn($q) => $q->whereIn('role_id', $this->roles->pluck('id')))
            ->get();
    }

    public function hasPermissionTo($permission): bool
    {
        if (is_string($permission)) {
            return $this->getAllPermissions()->contains('name', $permission);
        }
        return $this->getAllPermissions()->contains($permission);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        return $this->getAllPermissions()->pluck('name')->intersect($permissions)->isNotEmpty();
    }
}
