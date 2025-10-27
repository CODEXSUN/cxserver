<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactFeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'rating' => $this->rating,
            'comments' => $this->comments,
            'would_recommend' => $this->would_recommend,
            'feedback_at' => $this->feedback_at?->toDateTimeString(),
        ];
    }
}
