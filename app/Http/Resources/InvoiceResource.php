<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'job' => new JobResource($this->whenLoaded('job')),
            'amount' => $this->amount,
            'tax' => $this->tax,
            'total' => $this->total,
            'status' => $this->status,
            'issued_at' => $this->issued_at?->toDateTimeString(),
            'due_date' => $this->due_date?->toDateTimeString(),
            'paid_at' => $this->paid_at?->toDateTimeString(),
            'is_overdue' => $this->status === 'overdue',
        ];
    }
}
