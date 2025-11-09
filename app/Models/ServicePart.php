<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServicePart extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'part_code',
        'name',
        'brand',
        'model',
        'unit_price',
        'current_stock',
        'remarks',
        'barcode',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
    ];

    public function images()
    {
        return $this->hasMany(ServicePartImage::class)
            ->orderBy('is_primary', 'desc')
            ->orderBy('sort_order')
            ->orderBy('id');
    }
}
