<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactFeedback extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'job_id', 'contact_id', 'rating', 'comments',
        'would_recommend', 'feedback_at'
    ];

    protected $casts = [
        'rating' => 'integer',
        'would_recommend' => 'boolean',
        'feedback_at' => 'datetime',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
