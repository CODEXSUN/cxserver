<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Contact::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:contacts,phone',
            'email' => 'nullable|email|unique:contacts,email',
            'contact_type' => 'required|in:customer,supplier,both',
            'has_account' => 'boolean',
        ];
    }
}
