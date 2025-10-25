<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class category extends Model
{
    protected $fillable = ['name', 'description'];

    public function todos()
    {
        return $this->hasMany(Todo::class);
    }
}
