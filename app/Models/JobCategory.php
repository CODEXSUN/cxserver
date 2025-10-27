<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobCategory extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = ['name', 'slug', 'color', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'category_id');
    }
}
