<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CallLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contact_id',
        'user_id',
        'call_type',
        'mobile',
        'duration',
        'enquiry',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(CallLogNote::class)->orderBy('created_at');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(CallLogNote::class, 'parent_id')->orderBy('created_at');
    }
}
