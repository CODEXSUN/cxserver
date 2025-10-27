<?php

namespace App\Policies;

use App\Models\SlaTicket;
use App\Models\User;

class SlaTicketPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('view sla'); }
    public function view(User $user, SlaTicket $ticket): bool { return $user->can('view sla'); }
    public function create(User $user): bool { return false; } // Auto-generated
    public function update(User $user, SlaTicket $ticket): bool { return false; }
}
