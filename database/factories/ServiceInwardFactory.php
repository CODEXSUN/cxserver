<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\ServiceInward;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceInwardFactory extends Factory
{
    protected $model = ServiceInward::class;

    public function definition(): array
    {
        return [
            'rma'          => 'RMA-' . $this->faker->unique()->numerify('######'),
            'contact_id'   => Contact::factory(),
            'material_type'=> $this->faker->randomElement(['laptop', 'desktop', 'printer']),
            'brand'        => $this->faker->randomElement(['Dell', 'HP', 'Lenovo', 'Canon', 'Epson']),
            'model'        => $this->faker->bothify('??-####'),
            'serial_no'    => $this->faker->unique()->regexify('[A-Z0-9]{10}'),
            'passwords'    => $this->faker->optional()->password,
            'photo_url'    => $this->faker->optional()->imageUrl(640, 480, 'technics'),
            'observation'  => $this->faker->paragraph,
            'received_by'  => User::factory(),
            'received_date'=> $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
