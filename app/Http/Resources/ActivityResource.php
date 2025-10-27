<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'subject' => $this->whenLoaded('subject', fn() => new ($this->subject_type . 'Resource')($this->subject)),
            'action' => $this->action,
            'properties' => $this->properties,
            'note' => $this->note,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
