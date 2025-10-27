<?php

namespace Tests\Feature\User;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed RBAC data
        $this->seed(\Database\Seeders\UserRABCSeeder::class);

        $this->admin = User::where('email', 'admin@admin.com')->first();
        $this->manager = User::where('email', 'manager@manager.com')->first();
        $this->regularUser = User::where('email', 'user@user.com')->first();
    }

    public function test_1_admin_can_list_users_with_pagination_and_filters()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/users?per_page=5&search=admin');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'email', 'active', 'roles']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ])
            ->assertJsonCount(3, 'data'); // sundar, admin, demo
    }

    public function test_2_admin_can_create_user()
    {
        $data = [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'active' => false
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/users', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'active'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@test.com',
            'active' => false
        ]);
    }

    public function test_3_regular_user_cannot_create_user()
    {
        $data = [
            'name' => 'Hacker',
            'email' => 'hacker@test.com',
            'password' => 'pass123',
            'password_confirmation' => 'pass123'
        ];

        $response = $this->actingAs($this->regularUser)->postJson('/api/users', $data);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('users', ['email' => 'hacker@test.com']);
    }

    public function test_4_admin_can_view_any_user()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/users/' . $this->manager->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $this->manager->id,
                'email' => $this->manager->email,
                'roles' => [['name' => 'manager']]
            ]);
    }

    public function test_5_user_can_view_own_profile()
    {
        $response = $this->actingAs($this->regularUser)->getJson('/api/users/' . $this->regularUser->id);

        $response->assertStatus(200)
            ->assertJson(['email' => $this->regularUser->email]);
    }

    public function test_6_user_cannot_view_other_user_without_permission()
    {
        $response = $this->actingAs($this->regularUser)->getJson('/api/users/' . $this->admin->id);

        $response->assertStatus(403);
    }

    public function test_7_admin_can_update_user()
    {
        $updateData = [
            'name' => 'Updated Name',
            'active' => false
        ];

        $response = $this->actingAs($this->admin)->putJson('/api/users/' . $this->manager->id, $updateData);

        $response->assertStatus(200)
            ->assertJson(['name' => 'Updated Name']);

        $this->assertDatabaseHas('users', [
            'id' => $this->manager->id,
            'name' => 'Updated Name',
            'active' => false
        ]);
    }

    public function test_8_user_can_update_own_profile()
    {
        $response = $this->actingAs($this->regularUser)->putJson('/api/users/' . $this->regularUser->id, [
            'name' => 'My New Name'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->regularUser->id,
            'name' => 'My New Name'
        ]);
    }

    public function test_9_user_cannot_update_other_user()
    {
        $response = $this->actingAs($this->regularUser)->putJson('/api/users/' . $this->manager->id, [
            'name' => 'Hacked'
        ]);

        $response->assertStatus(403);
    }

    public function test_10_admin_can_delete_user()
    {
        $user = User::factory()->create(['active' => true]);

        $response = $this->actingAs($this->admin)->deleteJson('/api/users/' . $user->id);

        $response->assertStatus(204);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_11_non_admin_cannot_delete_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->regularUser)->deleteJson('/api/users/' . $user->id);

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_12_admin_can_assign_role_to_user()
    {
        $clientRole = Role::where('name', 'client')->first();
        $targetUser = User::factory()->create();

        $response = $this->actingAs($this->admin)->postJson("/api/users/{$targetUser->id}/assign-role", [
            'role_id' => $clientRole->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Role assigned']);

        $this->assertDatabaseHas('role_user', [
            'user_id' => $targetUser->id,
            'role_id' => $clientRole->id
        ]);
    }

    public function test_13_assign_role_validates_role_exists()
    {
        $response = $this->actingAs($this->admin)->postJson("/api/users/{$this->manager->id}/assign-role", [
            'role_id' => 999
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role_id']);
    }

    public function test_14_non_admin_cannot_assign_role()
    {
        $role = Role::where('name', 'manager')->first();

        $response = $this->actingAs($this->regularUser)->postJson("/api/users/1/assign-role", [
            'role_id' => $role->id
        ]);

        $response->assertStatus(403);
    }

    public function test_15_admin_can_remove_role_from_user()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'client')->first();
        $user->roles()->attach($role->id);

        $response = $this->actingAs($this->admin)->postJson("/api/users/{$user->id}/remove-role", [
            'role_id' => $role->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Role removed']);

        $this->assertDatabaseMissing('role_user', [
            'user_id' => $user->id,
            'role_id' => $role->id
        ]);
    }

    public function test_16_pagination_and_filtering_works()
    {
        User::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/users?per_page=10&page=2');

        $response->assertStatus(200)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_17_filter_by_active_status()
    {
        $inactive = User::factory()->create(['active' => false]);

        $response = $this->actingAs($this->admin)->getJson('/api/users?filter[active]=false');

        $response->assertStatus(200)
            ->assertJsonFragment(['email' => $inactive->email]);
    }

    public function test_18_filter_by_role()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/users?filter[roles]=admin');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data'); // sundar, admin, demo
    }
}
