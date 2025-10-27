<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contact_code' => $this->contact_code,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'contact_type' => $this->contact_type,
            'has_account' => $this->has_account,
            'status' => $this->status,
            'enquiry_count' => $this->enquiries_count ?? 0,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'deleted_at' => $this->when($this->trashed(), $this->deleted_at?->toDateTimeString()),
        ];
    }
}
