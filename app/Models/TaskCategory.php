<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskCategory extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = ['name', 'slug', 'color', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'task_category_id');
    }

    public function scopeFilter($query, $filters)
    {
        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== null) {
            $boolValue = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $boolValue);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        }

        return $query;
    }
}
