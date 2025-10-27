<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Contact $contact): bool { return true; }
    public function create(User $user): bool { return $user->can('manage contacts'); }
    public function update(User $user, Contact $contact): bool { return $user->can('manage contacts'); }
    public function delete(User $user, Contact $contact): bool { return $user->can('manage contacts'); }
    public function restore(User $user, Contact $contact): bool { return $user->can('manage contacts'); }
    public function forceDelete(User $user, Contact $contact): bool { return false; }
}
