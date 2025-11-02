<?php

namespace App\Policies;

use App\Models\Blog;
use App\Models\User;

class BlogPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) return true;
        return null;
    }

    public function viewAny(User $user): bool { return $user->hasPermissionTo('blog.list'); }
    public function view(User $user, Blog $blog): bool { return $user->hasPermissionTo('blog.read'); }
    public function create(User $user): bool { return $user->hasPermissionTo('blog.create'); }
    public function update(User $user, Blog $blog): bool { return $user->hasPermissionTo('blog.update'); }
    public function delete(User $user, Blog $blog): bool { return $user->hasPermissionTo('blog.delete'); }
    public function restore(User $user, Blog $blog): bool { return $user->hasPermissionTo('blog.restore'); }
    public function forceDelete(User $user, Blog $blog): bool { return $user->hasPermissionTo('blog.delete'); }
}
