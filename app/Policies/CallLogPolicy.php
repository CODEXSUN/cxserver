<?php

namespace App\Policies;

use App\Models\CallLog;
use App\Models\User;

class CallLogPolicy
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
     * Determine whether the user can view any call logs.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('call_log.list');
    }

    /**
     * Determine whether the user can view the call log.
     */
    public function view(User $user, CallLog $callLog): bool
    {
        return $user->hasPermissionTo('call_log.read');
    }

    /**
     * Determine whether the user can create call logs.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('call_log.create');
    }

    /**
     * Determine whether the user can update the call log.
     */
    public function update(User $user, CallLog $callLog): bool
    {
        return $user->hasPermissionTo('call_log.update');
    }

    /**
     * Determine whether the user can delete the call log.
     */
    public function delete(User $user, CallLog $callLog): bool
    {
        return $user->hasPermissionTo('call_log.delete');
    }

    /**
     * Determine whether the user can restore the call log.
     */
    public function restore(User $user, CallLog $callLog): bool
    {
        return $user->hasPermissionTo('call_log.restore');
    }

    /**
     * Determine whether the user can permanently delete the call log.
     */
    public function forceDelete(User $user, CallLog $callLog): bool
    {
        return $user->hasPermissionTo('call_log.delete');
    }
}
