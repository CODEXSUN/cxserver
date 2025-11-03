<?php
// app/Models/ContactType.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    // Scope for active types
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
