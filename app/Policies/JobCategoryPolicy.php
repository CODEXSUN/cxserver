<?php

namespace App\Policies;

use App\Models\JobCategory;
use App\Models\User;

class JobCategoryPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage categories'); }
    public function view(User $user, JobCategory $jobCategory): bool { return $user->can('manage categories'); }
    public function create(User $user): bool { return $user->can('manage categories'); }
    public function update(User $user, JobCategory $jobCategory): bool { return $user->can('manage categories'); }
    public function delete(User $user, JobCategory $jobCategory): bool { return $user->can('manage categories'); }
    public function restore(User $user, JobCategory $jobCategory): bool { return $user->can('manage categories'); }
}
