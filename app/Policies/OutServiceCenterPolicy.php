<?php


namespace App\Policies;

use App\Models\OutServiceCenter;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OutServiceCenterPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view out service centers');
    }

    public function view(User $user, OutServiceCenter $center): bool
    {
        return $user->hasPermissionTo('view out service centers');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create out service centers');
    }

    public function update(User $user, OutServiceCenter $center): bool
    {
        return $user->hasPermissionTo('edit out service centers');
    }

    public function delete(User $user, OutServiceCenter $center): bool
    {
        return $user->hasPermissionTo('delete out service centers');
    }

    public function restore(User $user, OutServiceCenter $center): bool
    {
        return $user->hasPermissionTo('delete out service centers');
    }

    public function forceDelete(User $user, OutServiceCenter $center): bool
    {
        return $user->hasPermissionTo('delete out service centers');
    }
}
