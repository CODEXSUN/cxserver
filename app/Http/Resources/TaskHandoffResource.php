<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskHandoffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_user' => new UserResource($this->whenLoaded('fromUser')),
            'to_user' => new UserResource($this->whenLoaded('toUser')),
            'reason' => $this->reason,
            'handoff_at' => $this->handoff_at->toDateTimeString(),
        ];
    }
}
