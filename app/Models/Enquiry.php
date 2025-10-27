<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enquiry extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'contact_id',
        'query',
        'status',
        'resolved_at',
        'tags'
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

    public function project(): HasOne
    {
        return $this->hasOne(Project::class);
    }

    public function slaTickets(): MorphMany
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

    public function scopeFilter($query, $filters)
    {
        // Example: status filter
        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }
        // Add more filters as needed
    }

    public function createSlaTicket()
    {
        // Dummy SLA creation – replace with real logic
        $this->slaTickets()->create([
            'status' => 'active',
            'due_at' => now()->addHours(24),
            'time_limit_minutes' => 1440, // 24 hours
        ]);
    }
}
