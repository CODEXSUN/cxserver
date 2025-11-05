<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobCard extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_no',
        'service_inward_id',
        'contact_id',
        'received_at',
        'service_status_id',
        'diagnosis',
        'estimated_cost',
        'advance_paid',
        'final_bill',
        'delivered_at',
        'final_status',      // e.g. "Completed", "In Progress", "Cancelled"
        'spares_applied',    // e.g. "Yes", "No", "HDD+RAM"
    ];

    protected $casts = [
        'received_at'   => 'datetime',
        'delivered_at'  => 'datetime',
    ];

    // Relationships
    public function serviceInward(): BelongsTo
    {
        return $this->belongsTo(ServiceInward::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ServiceStatus::class, 'service_status_id');
    }

    public function spares(): HasMany
    {
        return $this->hasMany(ServicePart::class);
    }

    // Optional: auto‑detect if spares exist
    public function getHasSparesAttribute(): bool
    {
        return $this->spares()->exists();
    }
}
