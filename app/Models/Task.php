<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'job_id', 'parent_task_id', 'category_id', 'task_code',
        'title', 'task_value', 'is_billable', 'priority',
        'due_date', 'status', 'started_at', 'completed_at', 'tags'
    ];

    protected $casts = [
        'task_value' => 'decimal:2',
        'is_billable' => 'boolean',
        'due_date' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'tags' => 'array',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TaskCategory::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TaskReply::class);
    }

    public function handoffs(): HasMany
    {
        return $this->hasManyThrough(TaskHandoff::class, TaskAssignment::class);
    }

    public function slaTickets()
    {
        return $this->morphMany(SlaTicket::class, 'ticketable');
    }

    public function otpTokens()
    {
        return $this->morphMany(OtpToken::class, 'tokenable');
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
