<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_code' => $this->job_code,
            'title' => $this->title,
            'enquiry' => new EnquiryResource($this->whenLoaded('enquiry')),
            'category' => new JobCategoryResource($this->whenLoaded('category')),
            'estimated_value' => $this->estimated_value,
            'billed_amount' => $this->billed_amount,
            'is_billable' => $this->is_billable,
            'status' => $this->status,
            'started_at' => $this->started_at?->toDateTimeString(),
            'completed_at' => $this->completed_at?->toDateTimeString(),
            'billed_at' => $this->billed_at?->toDateTimeString(),
            'tags' => $this->tags,
            'task_count' => $this->whenLoaded('tasks', fn() => $this->tasks->count()),
            'quotation_count' => $this->whenLoaded('quotations', fn() => $this->quotations->count()),
            'invoice_count' => $this->whenLoaded('invoices', fn() => $this->invoices->count()),
            'feedback' => ContactFeedbackResource::collection($this->whenLoaded('feedback')),
            'created_at' => $this->created_at->toDateTimeString(),
            'deleted_at' => $this->when($this->trashed(), $this->deleted_at?->toDateTimeString()),
        ];
    }
}
