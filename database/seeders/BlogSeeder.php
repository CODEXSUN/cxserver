<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get real users (from UserSeeder)
        $authors = User::whereIn('email', [
            'sundar@sundar.com',
            'admin@admin.com',
            'demo@demo.com',
            'manager@manager.com',
        ])->get();

        if ($authors->isEmpty()) {
            $this->command->warn('No users found. Run UserSeeder first.');
            return;
        }

        // === 1. Seed 50 normal blogs (published + draft) ===
        $normalBlogs = 50;
        $this->command->info("Seeding {$normalBlogs} blogs...");

        for ($i = 0; $i < $normalBlogs; $i++) {
            $title = $this->faker()->sentence;
            $published = $this->faker()->boolean(75); // 75% published

            Blog::create([
                'user_id'       => $authors->random()->id,
                'title'         => $title,
                'slug'          => Str::slug($title) . '-' . Str::random(4),
                'body'          => $this->faker()->paragraphs(3, true),
                'published'     => $published,
                'published_at'  => $published ? $this->faker()->dateTimeBetween('-1 year', 'now') : null,
            ]);
        }

        // === 2. Seed 5 trashed blogs (for restore testing) ===
        $trashedBlogs = 5;
        $this->command->info("Seeding {$trashedBlogs} trashed blogs...");

        for ($i = 0; $i < $trashedBlogs; $i++) {
            $title = '[TRASHED] ' . $this->faker()->sentence;
            $blog = Blog::create([
                'user_id'       => $authors->random()->id,
                'title'         => $title,
                'slug'          => Str::slug($title) . '-' . Str::random(4),
                'body'          => $this->faker()->paragraphs(2, true),
                'published'     => true,
                'published_at'  => $this->faker()->dateTimeBetween('-6 months', '-1 month'),
            ]);

            $blog->delete(); // soft delete
        }

        $this->command->info('Blog seeding completed!');
        $this->command->info('Total: ' . Blog::count() . ' | Trashed: ' . Blog::onlyTrashed()->count());
    }

    /**
     * Get Faker instance (Laravel 12+)
     */
    private function faker()
    {
        return \Faker\Factory::create();
    }
}
