<?php

namespace Database\Factories;

use App\Models\ServiceStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceStatusFactory extends Factory
{
    protected $model = ServiceStatus::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Received', 'Diagnosed', 'In Repair', 'Testing', 'Ready for Delivery',
                'Delivered', 'Cancelled', 'On Hold'
            ]),
        ];
    }
}
