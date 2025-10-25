<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'sundar@sundar.com'],
            [
                'name' => 'sundar',
                'password' => bcrypt('Kalarani1@@'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            RBACSeeder::class,
        ]);

    }
}
