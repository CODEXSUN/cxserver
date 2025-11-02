<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Psy\Util\Str;

class BlogFactory extends Factory
{
    protected $model = Blog::class;
    public function definition(): array
    {
        $title = $this->faker->sentence;

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'body' => $this->faker->paragraphs(3, true),
            'published' => $this->faker->boolean(70),
            'published_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function unpublished()
    {
        return $this->state(['published' => false, 'published_at' => null]);
    }
}
