<?php

// tests/Feature/ProjectCategoryApiTest.php

namespace Tests\Feature;

use App\Models\ProjectCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectCategoryApiTest extends TestCase
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

        $this->admin = User::where('email', 'admin@admin.com')->with('roles.permissions')->first();
        $this->manager = User::where('email', 'manager@manager.com')->with('roles.permissions')->first();
    }
    protected function tearDown(): void
    {
        // Force clear after each test
        ProjectCategory::query()->forceDelete();
        parent::tearDown();
    }

    public function test_1_admin_can_list_categories()
    {
        ProjectCategory::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/project-categories?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'projects_count']], 'meta']);
    }

    public function test_2_admin_can_create_category()
    {
        $payload = [
            'name' => 'Web Development',
            'color' => 'blue',
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/project-categories', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Web Development');

        $this->assertDatabaseHas('project_categories', ['slug' => 'web-development']);
    }

    public function test_3_admin_can_update_category()
    {
        $category = ProjectCategory::factory()->create();

        $response = $this->actingAs($this->admin)->putJson("/api/project-categories/{$category->id}", [
            'name' => 'Mobile App Dev',
            'is_active' => false
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('project_categories', ['id' => $category->id, 'is_active' => false]);
    }

    public function test_4_admin_can_delete_category()
    {
        $category = ProjectCategory::factory()->create();

        $response = $this->actingAs($this->admin)->deleteJson("/api/project-categories/{$category->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('project_categories', ['id' => $category->id]);
    }

    public function test_5_filter_by_active()
    {
        ProjectCategory::factory()->create(['is_active' => true]);
        ProjectCategory::factory()->count(2)->create(['is_active' => false]);

        $response = $this->actingAs($this->admin)->getJson('/api/project-categories?filter[is_active]=1');

        \Log::info('FILTER TEST RESPONSE', ['response' => $response->json()]);

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_active', true);
    }
}
