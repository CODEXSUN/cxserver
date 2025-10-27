<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactFactory extends Factory
{
    protected $model = Contact::class;

    public function definition(): array
    {
        return [
            'contact_code' => 'C' . $this->faker->unique()->numberBetween(1000, 9999),
            'name' => $this->faker->name,
            'phone' => '+' . $this->faker->unique()->numberBetween(1000000000, 9999999999),
            'email' => $this->faker->unique()->safeEmail,
            'contact_type' => $this->faker->randomElement(['customer', 'supplier', 'both']),
            'has_account' => $this->faker->boolean,
            'status' => $this->faker->randomElement(['active', 'inactive']),
        ];
    }
}
