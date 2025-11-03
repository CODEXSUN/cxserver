<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\ContactType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{
    protected $model = Contact::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'mobile' => $this->faker->unique()->phoneNumber,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->optional()->phoneNumber,
            'company' => $this->faker->optional()->company,
            'has_web_access' => $this->faker->boolean(20),
            'active' => $this->faker->boolean(90),
            'contact_type_id' => ContactType::inRandomOrder()->first() ?? ContactType::factory(),
            'user_id' => User::inRandomOrder()->first() ?? User::factory(),
        ];
    }
}
