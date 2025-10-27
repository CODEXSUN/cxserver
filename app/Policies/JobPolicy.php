<?php

namespace App\Policies;

use App\Models\Job;
use App\Models\User;

class JobPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Job $job): bool { return true; }
    public function create(User $user): bool { return $user->can('manage jobs'); }
    public function update(User $user, Job $job): bool { return $user->can('manage jobs'); }
    public function delete(User $user, Job $job): bool { return $user->can('manage jobs'); }
    public function restore(User $user, Job $job): bool { return $user->can('manage jobs'); }
}
