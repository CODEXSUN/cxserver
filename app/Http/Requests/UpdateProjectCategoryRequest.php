<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|unique:project_categories,name,' . $this->route('project_category'),
            'color' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
