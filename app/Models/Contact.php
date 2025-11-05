<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'mobile',
        'email',
        'phone',
        'company',
        'has_web_access',
        'active',
        'contact_type_id',
        'user_id',
    ];

    protected $casts = [
        'has_web_access' => 'boolean',
        'active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
    // Relationships
    public function contactType()
    {
        return $this->belongsTo(ContactType::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
