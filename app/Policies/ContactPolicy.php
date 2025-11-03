<?php

// app/Policies/ContactPolicy.php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    /**
     * Bypass all checks for super-admin
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super-admin')) {
            return true;
        }
        return null;
    }

    /**
     * Determine whether the user can view any contacts.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('contact.list');
    }

    /**
     * Determine whether the user can view the contact.
     */
    public function view(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('contact.read');
    }

    /**
     * Determine whether the user can create contacts.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('contact.create');
    }

    /**
     * Determine whether the user can update the contact.
     */
    public function update(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('contact.update');
    }

    /**
     * Determine whether the user can delete the contact.
     */
    public function delete(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('contact.delete');
    }

    /**
     * Determine whether the user can restore the contact.
     */
    public function restore(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('contact.restore');
    }

    /**
     * Determine whether the user can permanently delete the contact.
     */
    public function forceDelete(User $user, Contact $contact): bool
    {
        return $user->hasPermissionTo('contact.delete');
    }
}
