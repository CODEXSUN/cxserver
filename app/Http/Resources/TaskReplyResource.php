<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'message' => $this->message,
            'is_internal' => $this->is_internal,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
