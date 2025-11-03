<?php

namespace App\Policies;

use App\Models\ContactType;
use App\Models\User;

class ContactTypePolicy
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
     * Determine whether the user can view any contact types.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('contact-type.list');
    }

    /**
     * Determine whether the user can view the contact type.
     */
    public function view(User $user, ContactType $contactType): bool
    {
        return $user->hasPermissionTo('contact-type.read');
    }

    /**
     * Determine whether the user can create contact types.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('contact-type.create');
    }

    /**
     * Determine whether the user can update the contact type.
     */
    public function update(User $user, ContactType $contactType): bool
    {
        return $user->hasPermissionTo('contact-type.update');
    }

    /**
     * Determine whether the user can delete the contact type.
     */
    public function delete(User $user, ContactType $contactType): bool
    {
        return $user->hasPermissionTo('contact-type.delete');
    }

    /**
     * Determine whether the user can restore the contact type.
     */
    public function restore(User $user, ContactType $contactType): bool
    {
        return $user->hasPermissionTo('contact-type.restore');
    }

    /**
     * Determine whether the user can permanently delete the contact type.
     */
    public function forceDelete(User $user, ContactType $contactType): bool
    {
        return $user->hasPermissionTo('contact-type.delete');
    }
}
