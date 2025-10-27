<?php

namespace App\Policies;

use App\Models\Enquiry;
use App\Models\User;

class EnquiryPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Enquiry $enquiry): bool { return true; }
    public function create(User $user): bool { return $user->can('manage enquiries'); }
    public function update(User $user, Enquiry $enquiry): bool { return $user->can('manage enquiries'); }
    public function delete(User $user, Enquiry $enquiry): bool { return $user->can('manage enquiries'); }
    public function restore(User $user, Enquiry $enquiry): bool { return $user->can('manage enquiries'); }
}
