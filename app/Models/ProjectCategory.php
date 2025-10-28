<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ProjectCategory extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = ['name', 'slug', 'color', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted()
    {
        static::creating(function ($category) {
            $category->slug = Str::slug($category->name);
        });

        static::updating(function ($category) {
            if ($category->isDirty('name')) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function Projects(): HasMany
    {
        return $this->hasMany(Project::class, 'project_category_id');
    }

    public function scopeFilter($query, $filters)
    {
        // Only apply filter if key exists AND value is not empty/null
        if (array_key_exists('is_active', $filters)) {
            $value = $filters['is_active'];

            // Skip if empty string or null
            if ($value === '' || $value === null) {
                return $query;
            }

            $boolValue = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $boolValue);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        }

        return $query;
    }
}
