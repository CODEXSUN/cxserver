<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Task $task): bool { return true; }
    public function create(User $user): bool { return $user->can('manage tasks'); }
    public function update(User $user, Task $task): bool
    {
        return $user->can('manage tasks') || $task->assignments()->where('user_id', $user->id)->exists();
    }
    public function delete(User $user, Task $task): bool { return $user->can('manage tasks'); }
    public function restore(User $user, Task $task): bool { return $user->can('manage tasks'); }
}
