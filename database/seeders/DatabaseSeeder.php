<?php

namespace Database\Seeders;

use App\Models\User;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::firstOrCreate(
            ['email' => 'sundar@sundar.com'],
            [
                'name' => 'sundar',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        User::factory(30)->create();

        $this->call([
            RBACSeeder::class,
            TodoEnhancementsSeeder::class,
        ]);

    }
}
