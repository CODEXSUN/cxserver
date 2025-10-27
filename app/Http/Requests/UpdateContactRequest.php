<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $contact = $this->route('contact');

        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|unique:contacts,phone,' . $contact->id,
            'email' => 'sometimes|email|unique:contacts,email,' . $contact->id,
            'status' => 'sometimes|in:active,inactive',
            'contact_type' => 'sometimes|in:customer,supplier,both',
        ];
    }
}
