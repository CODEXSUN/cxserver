<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlaTicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticketable' => $this->whenLoaded('ticketable', fn() => new ($this->ticketable_type . 'Resource')($this->ticketable)),
            'user' => new UserResource($this->whenLoaded('user')),
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'type' => $this->type,
            'time_limit_minutes' => $this->time_limit_minutes,
            'due_at' => $this->due_at?->toDateTimeString(),
            'status' => $this->status,
            'acknowledged_at' => $this->acknowledged_at?->toDateTimeString(),
            'resolved_at' => $this->resolved_at?->toDateTimeString(),
            'breached' => $this->status === 'breached',
        ];
    }
}
