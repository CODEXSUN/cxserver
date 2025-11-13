<?php

namespace App\Policies;

use App\Models\Todo;
use App\Models\User;

class TodoPolicy
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
        return $user->hasPermissionTo('todo.list');
    }

    public function view(User $user, Todo $todo): bool
    {
        if ($todo->visibility === 'public') return true;
        if ($todo->user_id === $user->id) return true;
        if ($todo->assignee_id === $user->id) return true;
        return $user->hasPermissionTo('todo.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('todo.create');
    }

    public function update(User $user, Todo $todo): bool
    {
        if ($todo->user_id === $user->id) return true;
        return $user->hasPermissionTo('todo.update');
    }

    public function delete(User $user, Todo $todo): bool
    {
        if ($todo->user_id === $user->id) return true;
        return $user->hasPermissionTo('todo.delete');
    }

    public function restore(User $user, Todo $todo): bool
    {
        return $user->hasPermissionTo('todo.restore');
    }

    public function forceDelete(User $user, Todo $todo): bool
    {
        return $user->hasPermissionTo('todo.delete');
    }
}
