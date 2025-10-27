<?php

namespace Tests\Feature\User;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Run seeder
        $this->seed(\Database\Seeders\UserRABCSeeder::class);
    }

    public function test_1_admin_user_has_all_permissions()
    {
        $admin = User::where('email', 'admin@admin.com')->first();
        $this->assertNotNull($admin);

        $allPermissionNames = Permission::pluck('name')->toArray();

        foreach ($allPermissionNames as $permission) {
            $this->assertTrue(
                $admin->hasPermissionTo($permission),
                "Admin should have permission: {$permission}"
            );
        }

        $this->assertTrue($admin->hasRole('admin'));
    }

    public function test_2_manager_can_view_users_and_reports_but_cannot_delete_users()
    {
        $manager = User::where('email', 'manager@manager.com')->first();

        $this->assertTrue($manager->hasPermissionTo('viewAny users'));
        $this->assertTrue($manager->hasPermissionTo('view users'));
        $this->assertTrue($manager->hasPermissionTo('view reports'));

        $this->assertFalse($manager->hasPermissionTo('delete users'));
        $this->assertFalse($manager->hasPermissionTo('manage settings'));
    }

    public function test_3_standard_user_can_manage_contacts_but_not_users()
    {
        $user = User::where('email', 'standard@codexsun.com')->with('roles.permissions')->first();

        $this->assertTrue($user->hasPermissionTo('viewAny contacts'));
        $this->assertTrue($user->hasPermissionTo('create contacts'));
        $this->assertTrue($user->hasPermissionTo('update contacts'));

        $this->assertFalse($user->hasPermissionTo('viewAny users'));
        $this->assertFalse($user->hasPermissionTo('manage roles'));
    }

    public function test_4_client_can_only_view_own_contact_and_products()
    {
        $client = User::where('email', 'client@client.com')->first();

        $this->assertTrue($client->hasPermissionTo('view contacts'));
        $this->assertTrue($client->hasPermissionTo('view products'));

        $this->assertFalse($client->hasPermissionTo('viewAny contacts'));
        $this->assertFalse($client->hasPermissionTo('create contacts'));
    }

    public function test_5_dealer_can_view_products_and_contacts_list()
    {
        $dealer = User::where('email', 'dealer@dealer.com')->first();

        $this->assertTrue($dealer->hasPermissionTo('viewAny products'));
        $this->assertTrue($dealer->hasPermissionTo('view products'));
        $this->assertTrue($dealer->hasPermissionTo('view contacts'));

        $this->assertFalse($dealer->hasPermissionTo('create products'));
        $this->assertFalse($dealer->hasPermissionTo('delete contacts'));
    }

    public function test_6_guest_can_only_view_products()
    {
        $guestRole = Role::where('name', 'guest')->first();
        $guest = User::factory()->create(['email' => 'guest@test.com', 'active' => true]);
        $guest->roles()->sync([$guestRole->id]);

        $this->assertTrue($guest->hasPermissionTo('view products'));
        $this->assertFalse($guest->hasPermissionTo('view contacts'));
        $this->assertFalse($guest->hasPermissionTo('viewAny products'));
    }

    public function test_7_devops_has_full_access_like_admin()
    {
        $devops = User::where('email', 'devops@codexsun.com')->first();

        $this->assertTrue($devops->hasRole('devops'));
        $this->assertTrue($devops->hasPermissionTo('manage settings'));
        $this->assertTrue($devops->hasPermissionTo('delete users'));
    }

    public function test_8_inactive_user_is_marked_correctly()
    {
        $user = User::where('email', 'admin@admin.com')->first();
        $this->assertNotNull($user);

        $user->update(['active' => false]);

        $freshUser = $user->fresh();
        $this->assertIsBool($freshUser->active);           // ← Ensures boolean
        $this->assertFalse($freshUser->active);            // ← Now passes
    }

    public function test_9_role_and_permission_pivot_tables_are_populated_correctly()
    {
        $admin = Role::where('name', 'admin')->first();
        $totalPermissions = Permission::count();

        $this->assertEquals($totalPermissions, $admin->permissions()->count());

        $manager = Role::where('name', 'manager')->first();
        $this->assertTrue($manager->permissions()->where('name', 'view reports')->exists());
        $this->assertFalse($manager->permissions()->where('name', 'delete users')->exists());
    }

    public function test_10_user_role_assignment_via_pivot_is_correct()
    {
        $sundar = User::where('email', 'sundar@sundar.com')->first();
        $this->assertTrue($sundar->hasRole('admin'));

        $client = User::where('email', 'client@client.com')->first();
        $this->assertTrue($client->hasRole('client'));
        $this->assertFalse($client->hasRole('admin'));
    }
}
