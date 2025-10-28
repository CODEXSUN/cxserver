<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('task_categories')->ignore($this->task_category),
            ],
            'color' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
