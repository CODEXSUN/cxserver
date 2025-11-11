<?php

namespace App\Policies;

use App\Models\ReadyForDelivery;
use App\Models\User;

class ReadyForDeliveryPolicy
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
        return $user->hasPermissionTo('ready_for_delivery.list');
    }

    public function view(User $user, ReadyForDelivery $ready): bool
    {
        return $user->hasPermissionTo('ready_for_delivery.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('ready_for_delivery.create');
    }

    public function update(User $user, ReadyForDelivery $ready): bool
    {
        return $user->hasPermissionTo('ready_for_delivery.update');
    }

    public function delete(User $user, ReadyForDelivery $ready): bool
    {
        return $user->hasPermissionTo('ready_for_delivery.delete');
    }

    public function restore(User $user, ReadyForDelivery $ready): bool
    {
        return $user->hasPermissionTo('ready_for_delivery.restore');
    }

    public function forceDelete(User $user, ReadyForDelivery $ready): bool
    {
        return $user->hasPermissionTo('ready_for_delivery.delete');
    }
}
