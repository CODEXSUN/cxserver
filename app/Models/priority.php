<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class priority extends Model
{
    protected $fillable = ['name', 'level', 'description'];

    public function todos()
    {
        return $this->hasMany(Todo::class);
    }
}
