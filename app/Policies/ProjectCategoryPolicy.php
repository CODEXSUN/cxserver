<?php

namespace App\Policies;

use App\Models\ProjectCategory;
use App\Models\User;

class ProjectCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('viewAny project categories');
    }

    public function view(User $user, ProjectCategory $category): bool
    {
        return $user->hasPermissionTo('view project categories');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create project categories');
    }

    public function update(User $user, ProjectCategory $category): bool
    {
        return $user->hasPermissionTo('update project categories');
    }

    public function delete(User $user, ProjectCategory $category): bool
    {
        return $user->hasPermissionTo('delete project categories');
    }
}
