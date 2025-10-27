<?php
// app/Http/Requests/UpdateEnquiryRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEnquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'query'  => 'sometimes|required|string',
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'tags'   => 'nullable|array',
            'tags.*' => 'string',
        ];
    }
}
