<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskCategory extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = ['name', 'slug', 'color', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'category_id');
    }
}
