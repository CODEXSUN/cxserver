<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage Invoice'); }
    public function view(User $user, Invoice $invoice): bool { return $user->can('manage Invoice'); }
    public function create(User $user): bool { return $user->can('manage Invoice'); }
    public function update(User $user, Invoice $invoice): bool { return $user->can('manage Invoice'); }
    public function delete(User $user, Invoice $invoice): bool { return $user->can('manage Invoice'); }
    public function restore(User $user, Invoice $invoice): bool { return $user->can('manage Invoice'); }
}
