<?php

namespace App\Policies;

use App\Models\ServicePart;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ServicePartPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view service parts');
    }

    public function view(User $user, ServicePart $part): bool
    {
        return $user->hasPermissionTo('view service parts');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create service parts');
    }

    public function update(User $user, ServicePart $part): bool
    {
        return $user->hasPermissionTo('edit service parts');
    }

    public function delete(User $user, ServicePart $part): bool
    {
        return $user->hasPermissionTo('delete service parts');
    }

    public function restore(User $user, ServicePart $part): bool
    {
        return $user->hasPermissionTo('delete service parts');
    }

    public function forceDelete(User $user, ServicePart $part): bool
    {
        return $user->hasPermissionTo('delete service parts');
    }
}
