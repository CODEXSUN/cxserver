<?php


namespace App\Policies;

use App\Models\JobCard;
use App\Models\User;

class JobCardPolicy
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
        return $user->hasPermissionTo('job_card.list');
    }

    public function view(User $user, JobCard $jobCard): bool
    {
        return $user->hasPermissionTo('job_card.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('job_card.create');
    }

    public function update(User $user, JobCard $jobCard): bool
    {
        return $user->hasPermissionTo('job_card.update');
    }

    public function delete(User $user, JobCard $jobCard): bool
    {
        return $user->hasPermissionTo('job_card.delete');
    }

    public function restore(User $user, JobCard $jobCard): bool
    {
        return $user->hasPermissionTo('job_card.restore');
    }

    public function forceDelete(User $user, JobCard $jobCard): bool
    {
        return $user->hasPermissionTo('job_card.delete');
    }
}
