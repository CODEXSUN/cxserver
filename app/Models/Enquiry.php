<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enquiry extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'contact_id',
        'query',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'tags' => 'array',
        'status' => 'string',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function job(): HasOne
    {
        return $this->hasOne(Job::class);
    }

    public function slaTickets()
    {
        return $this->morphMany(SlaTicket::class, 'ticketable');
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function markAsResolved(): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }
}
