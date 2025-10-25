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
        Category::firstOrCreate(['name' => 'Urgent'], ['description' => 'High urgency items']);

        // Seed Priorities (from TodoEnhancementsSeeder)
        Priority::firstOrCreate(['name' => 'High'], ['level' => 1, 'description' => 'Immediate attention']);
        Priority::firstOrCreate(['name' => 'Medium'], ['level' => 2, 'description' => 'Normal priority']);
        Priority::firstOrCreate(['name' => 'Low'], ['level' => 3, 'description' => 'Can wait']);

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
                'title' => "Todo Task #{$i}",
                'description' => "Description for task #{$i} in ERP system.",
                'completed' => (bool) rand(0, 1),  // Random true/false
                'category_id' => rand(1, 3),  // Reference seeded categories 1-3
                'priority_id' => rand(1, 3),  // Reference seeded priorities 1-3
                'active' => true,
                'position' => $i * 10,  // Incremental positions (10, 20, 30...)
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
