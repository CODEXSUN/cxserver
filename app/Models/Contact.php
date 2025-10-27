<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contact_code',
        'name',
        'phone',
        'email',
        'contact_type',
        'has_account',
        'status',
    ];

    protected $casts = [
        'has_account' => 'boolean',
        'contact_type' => 'string',
        'status' => 'string',
    ];

    public function scopeFilter($query, $filters)
    {
        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($search = $filters['search'] ?? null) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    public function enquiries(): HasMany
    {
        return $this->hasMany(Enquiry::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(ContactFeedback::class);
    }

    public function slaTickets(): MorphMany
    {
        return $this->morphMany(SlaTicket::class, 'ticketable');
    }
}
