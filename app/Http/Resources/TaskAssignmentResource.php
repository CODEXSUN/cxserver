<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'task' => new TaskResource($this->whenLoaded('task')),
            'user' => new UserResource($this->whenLoaded('user')),
            'assigned_by' => new UserResource($this->whenLoaded('assignedBy')),
            'status' => $this->status,
            'user_notes' => $this->user_notes,
            'admin_feedback' => $this->admin_feedback,
            'assigned_at' => $this->assigned_at->toDateTimeString(),
            'accepted_at' => $this->accepted_at?->toDateTimeString(),
            'submitted_at' => $this->submitted_at?->toDateTimeString(),
            'approved_at' => $this->approved_at?->toDateTimeString(),
            'returned_at' => $this->returned_at?->toDateTimeString(),
            'replies' => TaskReplyResource::collection($this->whenLoaded('replies')),
            'handoffs' => TaskHandoffResource::collection($this->whenLoaded('handoffs')),
            'deleted_at' => $this->when($this->trashed(), $this->deleted_at?->toDateTimeString()),
        ];
    }
}
