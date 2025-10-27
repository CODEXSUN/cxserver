<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'task_code' => $this->task_code,
            'title' => $this->title,
            'job' => new JobResource($this->whenLoaded('job')),
            'parent' => new TaskResource($this->whenLoaded('parent')),
            'category' => new TaskCategoryResource($this->whenLoaded('category')),
            'task_value' => $this->task_value,
            'is_billable' => $this->is_billable,
            'priority' => $this->priority,
            'due_date' => $this->due_date?->toDateTimeString(),
            'status' => $this->status,
            'started_at' => $this->started_at?->toDateTimeString(),
            'completed_at' => $this->completed_at?->toDateTimeString(),
            'tags' => $this->tags,
            'assignments' => TaskAssignmentResource::collection($this->whenLoaded('assignments')),
            'replies' => TaskReplyResource::collection($this->whenLoaded('replies')),
            'subtask_count' => $this->whenLoaded('subtasks', fn() => $this->subtasks->count()),
            'sla_tickets' => SlaTicketResource::collection($this->whenLoaded('slaTickets')),
            'created_at' => $this->created_at->toDateTimeString(),
            'deleted_at' => $this->when($this->trashed(), $this->deleted_at?->toDateTimeString()),
        ];
    }
}
