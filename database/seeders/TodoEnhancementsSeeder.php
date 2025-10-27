<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Priority;
use App\Models\Todo;  // Optional if updating existing todos

class TodoEnhancementsSeeder extends Seeder
{
    public function run()
    {
        // Seed Categories (from TodoEnhancementsSeeder)
        Category::firstOrCreate(['name' => 'Work'], ['description' => 'Work-related tasks']);
        Category::firstOrCreate(['name' => 'Personal'], ['description' => 'Personal errands']);
        Category::firstOrCreate(['name' => 'Other'], ['description' => 'Other items']);
        Category::firstOrCreate(['name' => 'Health'], ['description' => 'Healthy items']);

        // Seed Priorities (from TodoEnhancementsSeeder)
        Priority::firstOrCreate(['name' => 'Low'], ['level' => 1, 'description' => 'Can wait']);
        Priority::firstOrCreate(['name' => 'Medium'], ['level' => 2, 'description' => 'Normal priority']);
        Priority::firstOrCreate(['name' => 'High'], ['level' => 3, 'description' => 'Immediate attention']);

        // Assume user ID 1 exists; create a test user if not (from TodoSeeder)
        $user = User::find(1);
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Create 10 sample todos (from TodoSeeder)
        for ($i = 1; $i <= 10; $i++) {
            Todo::create([
                'user_id' => $user->id,
                'title' => "Todo Task #{$i}" . fake()->name(),
                'completed' => (bool) rand(0, 1),
                'category_id' => rand(1, 3),
                'due_date' => now()->addDays(rand(0, 365)),
                'priority_id' => rand(1, 3),
                'position' => $i * 10,
                'active' => true,
            ]);
        }

        // Optional: Update any pre-existing todos (from TodoEnhancementsSeeder)
        $existingTodos = Todo::where('user_id', $user->id)->whereNull('category_id')->get();  // Only update if not already set
        foreach ($existingTodos as $index => $todo) {
            $todo->update([
                'category_id' => ($index % 3) + 1,
                'priority_id' => ($index % 3) + 1,
                'active' => true,
                'position' => $index * 10 + 100,  // Offset to avoid conflicts
            ]);
        }
    }
}
