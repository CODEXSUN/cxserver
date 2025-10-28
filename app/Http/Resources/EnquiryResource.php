<?php
// app/Http/Resources/EnquiryResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'query' => $this->query,
            'status' => $this->status,
            'resolved_at' => $this->resolved_at?->format('Y-m-d H:i:s'),
            'tags' => $this->tags,
            'contact' => new ContactResource($this->contact),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'sla_ticket_count' => $this->sla_tickets_count ?? 0, // ← CORRECT
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
