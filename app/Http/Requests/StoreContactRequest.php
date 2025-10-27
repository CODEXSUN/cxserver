<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    public function rules(): array
    {
        return [
            'contact_code' => 'required|string|unique:contacts,contact_code',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:contacts,phone',
            'email' => 'nullable|email|unique:contacts,email',
            'contact_type' => 'required|in:customer,supplier,both',
            'has_account' => 'sometimes|boolean',
            'status' => 'required|in:active,inactive',
        ];
    }
}
