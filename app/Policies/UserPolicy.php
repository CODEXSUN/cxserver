<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user.list');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermissionTo('user.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasPermissionTo('user.update');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasPermissionTo('user.delete');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->hasPermissionTo('user.restore');
    }

    public function systemManage(User $user)
    {
        return $user->super_admin; // or role-based
    }
}
