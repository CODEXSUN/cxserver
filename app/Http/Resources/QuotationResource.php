<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_number' => $this->quote_number,
            'job' => new JobResource($this->whenLoaded('job')),
            'subtotal' => $this->subtotal,
            'tax' => $this->tax,
            'total' => $this->total,
            'notes' => $this->notes,
            'valid_until' => $this->valid_until?->toDateTimeString(),
            'status' => $this->status,
            'sent_at' => $this->sent_at?->toDateTimeString(),
            'accepted_at' => $this->accepted_at?->toDateTimeString(),
            'is_expired' => $this->valid_until && $this->valid_until->isPast(),
        ];
    }
}
