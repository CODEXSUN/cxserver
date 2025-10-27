<?php
// app/Http/Resources/EnquiryResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'contact'       => new ContactResource($this->whenLoaded('contact')),
            'query'         => $this->query,
            'status'        => $this->status,
            'resolved_at'   => $this->resolved_at?->format('Y-m-d H:i:s'),
            'tags'          => $this->tags,
            'sla_ticket_count' => $this->sla_tickets_count ?? 0,
            'created_at'    => $this->created_at->format('Y-m-d H:i:s'),
            'project' => new ProjectResource($this->whenLoaded('project')),
        ];
    }
}
