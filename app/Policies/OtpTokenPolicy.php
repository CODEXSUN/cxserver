<?php

namespace App\Policies;

use App\Models\OtpToken;
use App\Models\User;

class OtpTokenPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage Contact Feedback'); }
    public function view(User $user, OtpToken $otpToken): bool { return $user->can('manage Contact Feedback'); }
    public function create(User $user): bool { return $user->can('manage ContactFeedback'); }
    public function update(User $user, OtpToken $otpToken): bool { return $user->can('manage Contact Feedback'); }
    public function delete(User $user, OtpToken $otpToken): bool { return $user->can('manage Contact Feedback'); }
    public function restore(User $user, OtpToken $otpToken): bool { return $user->can('manage Contact Feedback'); }
}
