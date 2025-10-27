<?php

namespace Tests\Feature\Role;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Factories\RoleFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRABCSeeder::class);

        $this->admin = User::where('email', 'admin@admin.com')->first();
        $this->regularUser = User::where('email', 'user@user.com')->first();
    }

    public function test_1_admin_can_list_roles_with_pagination_and_search()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/roles?search=admin');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'description', 'permissions']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ])
            ->assertJsonPath('data.*.name', fn ($names) => in_array('admin', $names));
    }

    public function test_2_admin_can_create_role()
    {
        $data = [
            'name' => 'editor',
            'description' => 'Content editor role'
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/roles', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'editor')
            ->assertJsonPath('data.description', 'Content editor role');

        $this->assertDatabaseHas('roles', $data);
    }

    public function test_3_regular_user_cannot_create_role()
    {
        $response = $this->actingAs($this->regularUser)->postJson('/api/roles', [
            'name' => 'hacker'
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('roles', ['name' => 'hacker']);
    }

    public function test_4_admin_can_view_role_with_permissions()
    {
        $role = Role::where('name', 'manager')->first();

        $response = $this->actingAs($this->admin)->getJson("/api/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $role->id)
            ->assertJsonPath('data.name', 'manager')
            ->assertJsonPath('data.description', 'Can manage users and view reports')
            ->assertJsonPath('data.permissions.*.name', fn ($names) =>
                in_array('view reports', $names) &&
                in_array('viewAny users', $names) &&
                in_array('view contacts', $names)
            );
    }

    public function test_5_admin_can_update_role()
    {
        $role = Role::create(['name' => 'temp', 'description' => 'old']);

        $response = $this->actingAs($this->admin)->putJson("/api/roles/{$role->id}", [
            'name' => 'moderator',
            'description' => 'Updated role'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'moderator')
            ->assertJsonPath('data.description', 'Updated role');

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'moderator'
        ]);
    }

    public function test_6_regular_user_cannot_update_role()
    {
        $role = Role::where('name', 'client')->first();

        $response = $this->actingAs($this->regularUser)->putJson("/api/roles/{$role->id}", [
            'name' => 'hacked'
        ]);

        $response->assertStatus(403);
    }

    public function test_7_admin_can_delete_role()
    {
        $role = Role::create(['name' => 'deleteme']);

        $response = $this->actingAs($this->admin)->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('roles', ['id' => $role->id]);
    }

    public function test_8_regular_user_cannot_delete_role()
    {
        $role = Role::where('name', 'guest')->first();

        $response = $this->actingAs($this->regularUser)->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_9_admin_can_assign_permission_to_role()
    {
        $role = Role::create(['name' => 'tester']);
        $perm = Permission::where('name', 'view products')->first();

        $response = $this->actingAs($this->admin)->postJson("/api/roles/{$role->id}/assign-permission", [
            'permission_id' => $perm->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Permission assigned']);

        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => $perm->id
        ]);
    }

    public function test_10_assign_permission_validates_existence()
    {
        $role = Role::first();

        $response = $this->actingAs($this->admin)->postJson("/api/roles/{$role->id}/assign-permission", [
            'permission_id' => 99999
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['permission_id']);
    }

    public function test_11_regular_user_cannot_assign_permission()
    {
        $role = Role::first();
        $perm = Permission::first();

        $response = $this->actingAs($this->regularUser)->postJson("/api/roles/{$role->id}/assign-permission", [
            'permission_id' => $perm->id
        ]);

        $response->assertStatus(403);
    }

    public function test_12_admin_can_remove_permission_from_role()
    {
        $role = Role::where('name', 'admin')->first();
        $perm = Permission::where('name', 'manage settings')->first();
        $role->permissions()->attach($perm->id);

        $response = $this->actingAs($this->admin)->postJson("/api/roles/{$role->id}/remove-permission", [
            'permission_id' => $perm->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Permission removed']);

        $this->assertDatabaseMissing('permission_role', [
            'role_id' => $role->id,
            'permission_id' => $perm->id
        ]);
    }

    public function test_13_filter_roles_by_permission()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/roles?filter[permission]=view reports');

        $response->assertStatus(200)
            ->assertJsonPath('data.*.name', fn ($names) => in_array('manager', $names));
    }

    public function test_14_pagination_works_on_roles()
    {
        Role::factory()->count(25)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/roles?per_page=10&page=2');

        $response->assertStatus(200)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_15_role_name_must_be_unique_on_create()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/roles', [
            'name' => 'admin'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_16_role_name_unique_on_update_excluding_self()
    {
        $role1 = Role::create(['name' => 'role_a']);
        $role2 = Role::create(['name' => 'role_b']);

        $response = $this->actingAs($this->admin)->putJson("/api/roles/{$role2->id}", [
            'name' => 'role_a'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
