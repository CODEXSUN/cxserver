<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'enquiry_id' => \App\Models\Enquiry::factory(),
            'project_code' => Project::generateCode(),
            'title' => $this->faker->sentence(4),
            'estimated_value' => $this->faker->randomFloat(2, 1000, 100000),
            'status' => 'pending',
            'is_billable' => true,
        ];
    }
}
