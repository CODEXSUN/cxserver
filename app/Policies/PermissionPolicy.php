<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;

class PermissionPolicy
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
        return $user->hasPermission('permission.list');
    }

    public function view(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permission.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('permission.create');
    }

    public function update(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permission.update');
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permission.delete');
    }

    public function restore(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permission.restore');
    }

    public function forceDelete(User $user, Permission $permission): bool
    {
        return $user->hasPermission('permission.delete');
    }
}
