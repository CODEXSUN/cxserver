<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'enquiry_id', 'category_id', 'job_code', 'title',
        'estimated_value', 'billed_amount', 'is_billable',
        'status', 'started_at', 'completed_at', 'billed_at', 'tags'
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
        'billed_amount' => 'decimal:2',
        'is_billable' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'billed_at' => 'datetime',
        'tags' => 'array',
    ];

    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(ContactFeedback::class);
    }

    public function slaTickets()
    {
        return $this->morphMany(SlaTicket::class, 'ticketable');
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
