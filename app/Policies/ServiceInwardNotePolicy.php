<?php

namespace App\Policies;

use App\Models\ServiceInwardNote;
use App\Models\User;

class ServiceInwardNotePolicy
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
        return $user->hasPermissionTo('service_inward.read');
    }

    public function view(User $user, ServiceInwardNote $note): bool
    {
        return $user->hasPermissionTo('service_inward.read');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('service_inward_note.create');
    }

    public function update(User $user, ServiceInwardNote $note): bool
    {
        return $user->id === $note->user_id || $user->hasPermissionTo('service_inward_note.update');
    }

    public function delete(User $user, ServiceInwardNote $note): bool
    {
        return $user->id === $note->user_id || $user->hasPermissionTo('service_inward_note.delete');
    }
}
