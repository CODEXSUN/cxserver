<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'project_code' => $this->project_code,
            'title' => $this->title,
            'estimated_value' => $this->estimated_value,
            'billed_amount' => $this->billed_amount,
            'is_billable' => $this->is_billable,
            'status' => $this->status,
            'started_at' => $this->started_at?->format('Y-m-d H:i'),
            'completed_at' => $this->completed_at?->format('Y-m-d H:i'),
            'billed_at' => $this->billed_at?->format('Y-m-d H:i'),
            'tags' => $this->tags,
            'enquiry_id' => $this->enquiry_id,
            'category' => new ProjectCategoryResource($this->whenLoaded('category')),
        ];
    }
}
