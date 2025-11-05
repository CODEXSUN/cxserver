<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\JobCard;
use App\Models\ServiceInward;
use App\Models\ServiceStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobCardFactory extends Factory
{
    protected $model = JobCard::class;

    public function definition(): array
    {
        return [
            'job_no'           => 'JOB-' . $this->faker->unique()->numerify('######'),
            'service_inward_id'=> ServiceInward::factory(),
            'contact_id'       => Contact::factory(),
            'received_at'      => $this->faker->dateTimeBetween('-1 month', 'now'),
            'service_status_id'=> ServiceStatus::factory(),
            'diagnosis'        => $this->faker->paragraph,
            'estimated_cost'   => $this->faker->randomFloat(2, 100, 5000),
            'advance_paid'     => $this->faker->randomFloat(2, 0, 1000),
            'final_bill'       => null,
            'delivered_at'     => null,
            'final_status'     => $this->faker->randomElement(['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled']),
            'spares_applied'   => $this->faker->randomElement(['Yes', 'No', 'HDD+RAM', 'Battery']),
        ];
    }
}
