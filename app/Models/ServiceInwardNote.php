<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceInwardNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_inward_id',
        'user_id',
        'note',
        'is_reply',
        'parent_id',
    ];

    protected $casts = [
        'is_reply' => 'boolean',
    ];

    // Relationships
    public function serviceInward(): BelongsTo
    {
        return $this->belongsTo(ServiceInward::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ServiceInwardNote::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ServiceInwardNote::class, 'parent_id')->orderBy('created_at');
    }

    public function children(): HasMany
    {
        return $this->replies();
    }
}
