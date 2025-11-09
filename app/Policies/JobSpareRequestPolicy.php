<?php

namespace App\Policies;

use App\Models\JobSpareRequest;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class JobSpareRequestPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view job spare requests');
    }

    public function view(User $user, JobSpareRequest $request): bool
    {
        return $user->hasPermissionTo('view job spare requests');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create job spare requests');
    }

    public function update(User $user, JobSpareRequest $request): bool
    {
        return $user->hasPermissionTo('edit job spare requests');
    }

    public function delete(User $user, JobSpareRequest $request): bool
    {
        return $user->hasPermissionTo('delete job spare requests');
    }

    public function restore(User $user, JobSpareRequest $request): bool
    {
        return $user->hasPermissionTo('delete job spare requests');
    }

    public function forceDelete(User $user, JobSpareRequest $request): bool
    {
        return $user->hasPermissionTo('delete job spare requests');
    }
}
