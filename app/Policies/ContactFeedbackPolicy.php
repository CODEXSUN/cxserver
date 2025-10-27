<?php

namespace App\Policies;

use App\Models\ContactFeedback;
use App\Models\User;

class ContactFeedbackPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage Contact Feedback'); }
    public function view(User $user, ContactFeedback $ContactFeedback): bool { return $user->can('manage Contact Feedback'); }
    public function create(User $user): bool { return $user->can('manage ContactFeedback'); }
    public function update(User $user, ContactFeedback $ContactFeedback): bool { return $user->can('manage Contact Feedback'); }
    public function delete(User $user, ContactFeedback $ContactFeedback): bool { return $user->can('manage Contact Feedback'); }
    public function restore(User $user, ContactFeedback $ContactFeedback): bool { return $user->can('manage Contact Feedback'); }
}
