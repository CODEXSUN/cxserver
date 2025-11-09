<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobSpareRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_card_id',
        'service_part_id',
        'qty_requested',
        'qty_issued',
        'status',
        'requested_at',
        'user_id',
        'remarks',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'qty_requested' => 'integer',
        'qty_issued' => 'integer',
    ];

    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    public function servicePart(): BelongsTo
    {
        return $this->belongsTo(ServicePart::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
