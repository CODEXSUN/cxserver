<?php

namespace Database\Seeders;

use App\Models\User;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

//        User::factory(30)->create();

        $this->call([
            UserRABCSeeder::class,
            EnquiryRABCSeeder::class,
            ProjectCategoryRABCSeeder::class,
            TodoEnhancementsSeeder::class,
        ]);

    }
}
