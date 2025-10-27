<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_code',
        'name',
        'phone',
        'email',
        'contact_type',
        'has_account',
        'status',
    ];

    protected $casts = [
        'has_account' => 'boolean',
    ];

    public function detail(): HasOne
    {
        return $this->hasOne(ContactDetail::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    public function enquiries()
    {
        return $this->hasMany(Enquiry::class);
    }
}
