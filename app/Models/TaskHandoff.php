<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskHandoff extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'task_assignment_id', 'from_user_id', 'to_user_id', 'reason', 'handoff_at'
    ];

    protected $casts = ['handoff_at' => 'datetime'];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(TaskAssignment::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
