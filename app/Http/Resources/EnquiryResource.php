<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'query' => $this->query,
            'status' => $this->status,
            'resolved_at' => $this->resolved_at?->toDateTimeString(),
            'tags' => $this->tags,
            'job' => new JobResource($this->whenLoaded('job')),
            'sla_tickets' => SlaTicketResource::collection($this->whenLoaded('slaTickets')),
            'created_at' => $this->created_at->toDateTimeString(),
            'deleted_at' => $this->when($this->trashed(), $this->deleted_at?->toDateTimeString()),
        ];
    }
}
