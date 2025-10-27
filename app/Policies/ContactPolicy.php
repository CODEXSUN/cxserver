<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('viewAny contacts');
    }

    public function view(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('view contacts');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create contacts');
    }

    public function update(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('update contacts');
    }

    public function delete(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('delete contacts');
    }

    public function restore(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('restore contacts');
    }
}
