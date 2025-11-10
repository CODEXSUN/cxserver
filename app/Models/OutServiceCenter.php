<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OutServiceCenter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_card_id',
        'service_name',
        'sent_at',
        'expected_back',
        'cost',
        'received_back_at',
        'service_status_id',
        'user_id',
        'notes',
    ];

    protected $casts = [
        'sent_at'          => 'datetime',
        'expected_back'    => 'date',
        'received_back_at' => 'datetime',
        'cost'             => 'decimal:2',
    ];

    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ServiceStatus::class, 'service_status_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
