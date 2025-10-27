<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage Contact Feedback'); }
    public function view(User $user, Activity $activity): bool { return $user->can('manage Contact Feedback'); }
    public function create(User $user): bool { return $user->can('manage ContactFeedback'); }
    public function update(User $user, Activity $activity): bool { return $user->can('manage Contact Feedback'); }
    public function delete(User $user, Activity $activity): bool { return $user->can('manage Contact Feedback'); }
    public function restore(User $user, Activity $activity): bool { return $user->can('manage Contact Feedback'); }
}
