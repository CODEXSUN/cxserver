<?php


namespace Tests\Feature\Permission;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionApiTest extends TestCase
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

    public function test_1_admin_can_list_permissions_with_pagination_and_search()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/permissions?search=view reports');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'description', 'roles']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ])
            ->assertJsonPath('data.*.name', fn($names) => in_array('view reports', $names));
    }

    public function test_2_admin_can_create_permission()
    {
        $data = [
            'name' => 'custom create invoices', // ← NEW, not in seeder
            'description' => 'Create custom invoices'
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/permissions', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'custom create invoices')
            ->assertJsonPath('data.description', 'Create custom invoices');

        $this->assertDatabaseHas('permissions', $data);
    }

    public function test_3_regular_user_cannot_create_permission()
    {
        $response = $this->actingAs($this->regularUser)->postJson('/api/permissions', [
            'name' => 'hack system'
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('permissions', ['name' => 'hack system']);
    }

    public function test_4_admin_can_view_permission_with_roles()
    {
        $perm = Permission::where('name', 'view reports')->first();

        $response = $this->actingAs($this->admin)->getJson("/api/permissions/{$perm->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $perm->id)
            ->assertJsonPath('data.name', 'view reports')
            ->assertJsonPath('data.roles.*.name', fn($names) => in_array('manager', $names));
    }

    public function test_5_admin_can_update_permission()
    {
        $perm = Permission::create([
            'name' => 'temp unique permission',
            'description' => 'old description'
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/permissions/{$perm->id}", [
            'name' => 'updated unique permission', // ← NEW
            'description' => 'Updated description'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'updated unique permission');

        $this->assertDatabaseHas('permissions', [
            'id' => $perm->id,
            'name' => 'updated unique permission'
        ]);
    }

    public function test_6_regular_user_cannot_update_permission()
    {
        $perm = Permission::where('name', 'view products')->first();

        $response = $this->actingAs($this->regularUser)->putJson("/api/permissions/{$perm->id}", [
            'name' => 'hacked'
        ]);

        $response->assertStatus(403);
    }

    public function test_7_admin_can_delete_permission()
    {
        $perm = Permission::create(['name' => 'deleteme']);

        $response = $this->actingAs($this->admin)->deleteJson("/api/permissions/{$perm->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('permissions', ['id' => $perm->id]);
    }

    public function test_8_regular_user_cannot_delete_permission()
    {
        $perm = Permission::where('name', 'view products')->first();

        $response = $this->actingAs($this->regularUser)->deleteJson("/api/permissions/{$perm->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('permissions', ['id' => $perm->id]);
    }

    public function test_9_admin_can_assign_role_to_permission()
    {
        $perm = Permission::create(['name' => 'test perm']);
        $role = Role::where('name', 'client')->first();

        $response = $this->actingAs($this->admin)->postJson("/api/permissions/{$perm->id}/assign-role", [
            'role_id' => $role->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Role assigned to permission']);

        $this->assertDatabaseHas('permission_role', [
            'permission_id' => $perm->id,
            'role_id' => $role->id
        ]);
    }

    public function test_10_assign_role_validates_existence()
    {
        $perm = Permission::first();

        $response = $this->actingAs($this->admin)->postJson("/api/permissions/{$perm->id}/assign-role", [
            'role_id' => 99999
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role_id']);
    }

    public function test_11_regular_user_cannot_assign_role()
    {
        $perm = Permission::first();
        $role = Role::first();

        $response = $this->actingAs($this->regularUser)->postJson("/api/permissions/{$perm->id}/assign-role", [
            'role_id' => $role->id
        ]);

        $response->assertStatus(403);
    }

    public function test_12_admin_can_remove_role_from_permission()
    {
        $perm = Permission::where('name', 'view products')->first();
        $role = Role::where('name', 'client')->first();
        $perm->roles()->attach($role->id);

        $response = $this->actingAs($this->admin)->postJson("/api/permissions/{$perm->id}/remove-role", [
            'role_id' => $role->id
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Role removed from permission']);

        $this->assertDatabaseMissing('permission_role', [
            'permission_id' => $perm->id,
            'role_id' => $role->id
        ]);
    }

    public function test_13_filter_permissions_by_role()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/permissions?filter[role]=manager');

        $response->assertStatus(200)
            ->assertJsonPath('data.*.name', fn($names) => in_array('view reports', $names));
    }

    public function test_14_pagination_works_on_permissions()
    {
        Permission::factory()->count(25)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/permissions?per_page=10&page=2');

        $response->assertStatus(200)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 10);
    }

    public function test_15_permission_name_must_be_unique_on_create()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/permissions', [
            'name' => 'view products'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_16_permission_name_unique_on_update_excluding_self()
    {
        $perm1 = Permission::create(['name' => 'perm_a']);
        $perm2 = Permission::create(['name' => 'perm_b']);

        $response = $this->actingAs($this->admin)->putJson("/api/permissions/{$perm2->id}", [
            'name' => 'perm_a'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
