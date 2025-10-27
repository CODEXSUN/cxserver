<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SlaTicket extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'ticketable_id', 'ticketable_type', 'user_id', 'contact_id',
        'type', 'time_limit_minutes', 'due_at', 'status',
        'acknowledged_at', 'resolved_at'
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function ticketable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
