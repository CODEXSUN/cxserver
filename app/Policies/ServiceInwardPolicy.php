<?php

namespace App\Policies;

use App\Models\ServiceInward;
use App\Models\User;

class ServiceInwardPolicy
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

    /**
     * Determine whether the user can view any service inwards.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('service_inward.list');
    }

    /**
     * Determine whether the user can view the service inward.
     */
    public function view(User $user, ServiceInward $serviceInward): bool
    {
        return $user->hasPermissionTo('service_inward.read');
    }

    /**
     * Determine whether the user can create service inwards.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('service_inward.create');
    }

    /**
     * Determine whether the user can update the service inward.
     */
    public function update(User $user, ServiceInward $serviceInward): bool
    {
        return $user->hasPermissionTo('service_inward.update');
    }

    /**
     * Determine whether the user can delete the service inward.
     */
    public function delete(User $user, ServiceInward $serviceInward): bool
    {
        return $user->hasPermissionTo('service_inward.delete');
    }

    /**
     * Determine whether the user can restore the service inward.
     */
    public function restore(User $user, ServiceInward $serviceInward): bool
    {
        return $user->hasPermissionTo('service_inward.restore');
    }

    /**
     * Determine whether the user can permanently delete the service inward.
     */
    public function forceDelete(User $user, ServiceInward $serviceInward): bool
    {
        return $user->hasPermissionTo('service_inward.delete');
    }
}
