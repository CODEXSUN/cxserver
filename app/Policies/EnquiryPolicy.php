<?php

namespace App\Policies;

use App\Models\Enquiry;
use App\Models\User;

class EnquiryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('viewAny enquiries');
    }

    public function view(User $user, Enquiry $enquiry): bool
    {
        return $user->hasPermissionTo('view enquiries');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create enquiries');
    }

    public function update(User $user, Enquiry $enquiry): bool
    {
        return $user->hasPermissionTo('update enquiries');
    }

    public function delete(User $user, Enquiry $enquiry): bool
    {
        return $user->hasPermissionTo('delete enquiries');
    }

    public function restore(User $user, Enquiry $enquiry): bool
    {
        return $user->hasPermissionTo('restore enquiries');
    }

    public function resolve(User $user, Enquiry $enquiry): bool
    {
        return $user->hasPermissionTo('resolve enquiries');
    }

    public function convertToProject(User $user, Enquiry $enquiry): bool
    {
        return $user->hasPermissionTo('convert enquiry to project');
    }
}
