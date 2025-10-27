<?php

// app/Http/Requests/StoreEnquiryRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in policy
    }

    public function rules(): array
    {
        return [
            'contact_id' => 'required|exists:contacts,id',
            'query' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
        ];
    }
}
