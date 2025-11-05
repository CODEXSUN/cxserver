<?php

namespace Database\Seeders;

use App\Models\JobCard;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Faker;

class JobCardSeeder extends Seeder
{
    public function run(): void
    {
        JobCard::factory(5)->create()->each(function ($job) {
            // 50% chance to add spares
//            if (rand(0, 1)) {
//                $job->spares()->create([
//                    'name'    => fake()->word(),
//                    'part_code'  => fake()->regexify('[A-Z0-9]{8}'),
//                    'brand'     => fake()->numberBetween(1, 3),
//                    'model'   => fake()->randomFloat(2, 50, 500),
//                ]);
//            }

            // Auto‑mark inward
            $job->serviceInward->update(['job_created' => true]);
        });
    }
}
