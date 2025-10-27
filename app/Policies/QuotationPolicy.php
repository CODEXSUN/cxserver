<?php

namespace App\Policies;

use App\Models\Quotation;
use App\Models\User;

class QuotationPolicy extends BasePolicy
{
    public function viewAny(User $user): bool { return $user->can('manage Quotation'); }
    public function view(User $user, Quotation $quotation): bool { return $user->can('manage Quotation'); }
    public function create(User $user): bool { return $user->can('manage Quotation'); }
    public function update(User $user, Quotation $quotation): bool { return $user->can('manage Quotation'); }
    public function delete(User $user, Quotation $quotation): bool { return $user->can('manage Quotation'); }
    public function restore(User $user, Quotation $quotation): bool { return $user->can('manage Quotation'); }
}
