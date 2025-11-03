<?php
// database/factories/ContactTypeFactory.php

namespace Database\Factories;

use App\Models\ContactType;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactTypeFactory extends Factory
{
    protected $model = ContactType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Customer',
                'Vendor',
                'Partner',
                'Employee',
                'Lead',
                'Supplier',
                'Contractor',
                'Investor',
            ]),
            'description' => $this->faker->optional(0.7)->sentence,
            'is_active' => $this->faker->boolean(95),
        ];
    }
}
