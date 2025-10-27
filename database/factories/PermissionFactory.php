<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->regexify('[a-z]{5,20} [a-z]{5,10}'),
            'description' => $this->faker->sentence,
        ];
    }
}
