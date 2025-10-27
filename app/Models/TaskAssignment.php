<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskAssignment extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'task_id', 'user_id', 'assigned_by', 'status',
        'user_notes', 'admin_feedback', 'assigned_at',
        'accepted_at', 'submitted_at', 'approved_at', 'returned_at'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'accepted_at' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TaskReply::class);
    }

    public function handoffs(): HasMany
    {
        return $this->hasMany(TaskHandoff::class);
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
