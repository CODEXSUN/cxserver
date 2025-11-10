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
        'job_created'
    ];

    protected $casts = [
        'received_date' => 'datetime',
        'job_created' => 'boolean',
        'base_rma' => 'integer',
        'sub_item' => 'decimal:2',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function jobCard()
    {
        return $this->hasOne(JobCard::class);
    }

    protected static function booted()
    {
        static::saving(function ($model) {
            // Extract base and sub from RMA
            if (preg_match('/^(\d+)\.(\d+(?:\.\d+)?)$/', $model->rma, $matches)) {
                $model->base_rma = (int) $matches[1];
                $model->sub_item = (float) $matches[2];
            } else {
                // Fallback: treat as .0
                $model->base_rma = (int) $model->rma;
                $model->sub_item = 0;
            }
        });
    }
}
