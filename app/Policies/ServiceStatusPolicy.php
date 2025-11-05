<?php


namespace App\Policies;

use App\Models\ServiceStatus;
use App\Models\User;

class ServiceStatusPolicy
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
        return $user->hasPermissionTo('service_status.list');
    }

    public function view(User $user, ServiceStatus $status): bool
    {
        return $user->hasPermissionTo('service_status.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('service_status.create');
    }

    public function update(User $user, ServiceStatus $status): bool
    {
        return $user->hasPermissionTo('service_status.update');
    }

    public function delete(User $user, ServiceStatus $status): bool
    {
        return $user->hasPermissionTo('service_status.delete');
    }
}
