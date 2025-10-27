<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\Enquiry;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnquiryFactory extends Factory
{
    protected $model = Enquiry::class;

    public function definition(): array
    {
        return [
            'contact_id' => Contact::factory(),
            'query' => $this->faker->paragraph, // ← matches migration
            'status' => $this->faker->randomElement(['open', 'in_progress', 'resolved', 'closed']),
            'resolved_at' => $this->faker->optional(0.3)->dateTimeBetween('-1 month', 'now'), // 30% chance
            'tags' => $this->faker->optional(0.5)->words(3, true), // JSON string
        ];
    }

    public function open(): self
    {
        return $this->state(['status' => 'open', 'resolved_at' => null]);
    }

    public function resolved(): self
    {
        return $this->state([
            'status' => 'resolved',
            'resolved_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }
}
