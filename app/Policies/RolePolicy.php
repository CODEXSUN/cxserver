<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    /**
     * Bypass all checks for super-admin
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('role.list');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermission('role.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('role.create');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermission('role.update');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->hasPermission('role.delete');
    }

    public function restore(User $user, Role $role): bool
    {
        return $user->hasPermission('role.restore');
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return $user->hasPermission('role.delete');
    }
}
