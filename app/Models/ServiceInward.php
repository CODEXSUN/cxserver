<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceInward extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rma',
        'contact_id',
        'material_type',
        'brand',
        'model',
        'serial_no',
        'passwords',
        'photo_url',
        'observation',
        'received_by',
        'received_date',
    ];

    protected $casts = [
        'received_date' => 'datetime',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
