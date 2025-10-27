<?php

namespace App\Policies;

use App\Models\TaskAssignment;
use App\Models\User;

class TaskAssignmentPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, TaskAssignment $assignment): bool
    {
        return $user->id === $assignment->user_id || $user->can('manage tasks');
    }
    public function create(User $user): bool { return $user->can('assign tasks'); }
    public function update(User $user, TaskAssignment $assignment): bool
    {
        return $user->id === $assignment->user_id || $user->can('manage tasks');
    }
    public function delete(User $user, TaskAssignment $assignment): bool { return $user->can('manage tasks'); }
}
