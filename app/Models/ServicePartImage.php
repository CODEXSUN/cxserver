<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePartImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_part_id',
        'image_path',
        'thumb_path',
        'alt_text',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function servicePart(): BelongsTo
    {
        return $this->belongsTo(ServicePart::class);
    }
}
