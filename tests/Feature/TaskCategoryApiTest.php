<?php


namespace Tests\Feature;

use App\Models\TaskCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRABCSeeder::class);
        $this->seed(\Database\Seeders\EnquiryRABCSeeder::class);
        $this->seed(\Database\Seeders\ProjectCategoryRABCSeeder::class);
        $this->seed(\Database\Seeders\TaskCategoryRABCSeeder::class);

        $this->admin = User::where('email', 'admin@admin.com')->with('roles.permissions')->first();
        $this->manager = User::where('email', 'manager@manager.com')->with('roles.permissions')->first();
    }

    public function test_admin_can_list_categories()
    {
        TaskCategory::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/task-categories?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'tasks_count']], 'meta']);
    }

    public function test_admin_can_create_category()
    {
        $payload = [
            'name' => 'Web Development',
            'color' => 'blue',
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/task-categories', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Web Development');

        $this->assertDatabaseHas('task_categories', ['slug' => 'web-development']);
    }

    public function test_admin_can_update_category()
    {
        $category = TaskCategory::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/task-categories/{$category->id}", [
            'name' => 'Mobile App Dev',
            'is_active' => false
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('task_categories', ['id' => $category->id, 'is_active' => false]);
    }

    public function test_admin_can_delete_category()
    {
        $category = TaskCategory::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/task-categories/{$category->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('task_categories', ['id' => $category->id]);
    }

    public function test_filter_by_active()
    {
        TaskCategory::factory()->create(['is_active' => true]);
        TaskCategory::factory()->count(2)->create(['is_active' => false]);

        $response = $this->actingAs($this->admin)->getJson('/api/task-categories?filter[is_active]=1');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }
}
