<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReadyForDelivery extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_card_id',
        'user_id',
        'engineer_note',
        'future_note',
        'billing_details',
        'billing_amount',
        'delivered_confirmed_at',
        'delivered_confirmed_by',
        'delivered_otp',
        'service_status_id',
    ];

    protected $casts = [
        'delivered_confirmed_at' => 'datetime',
        'billing_amount'         => 'decimal:2',
    ];

    // -----------------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------------
    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function serviceStatus(): BelongsTo
    {
        return $this->belongsTo(ServiceStatus::class);
    }
}
