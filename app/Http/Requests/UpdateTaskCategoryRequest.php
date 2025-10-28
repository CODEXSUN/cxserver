<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|unique:task_categories,name,' . $this->route('task_category'),
            'color' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
