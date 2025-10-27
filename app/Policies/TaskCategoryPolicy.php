<?php

namespace App\Policies;

use App\Models\TaskCategory;
use App\Models\User;

class TaskCategoryPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage categories'); }
    public function view(User $user, TaskCategory $category): bool { return $user->can('manage categories'); }
    public function create(User $user): bool { return $user->can('manage categories'); }
    public function update(User $user, TaskCategory $category): bool { return $user->can('manage categories'); }
    public function delete(User $user, TaskCategory $category): bool { return $user->can('manage categories'); }
    public function restore(User $user, TaskCategory $category): bool { return $user->can('manage categories'); }
}
