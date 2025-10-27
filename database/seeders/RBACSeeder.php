<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RBACSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Roles matching frontend
        $superadmin = Role::firstOrCreate(['name' => 'superadmin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $cashier = Role::firstOrCreate(['name' => 'cashier']);
        $manager = Role::firstOrCreate(['name' => 'manager']);

        // Permissions based on controller usage
        $viewUsers = Permission::firstOrCreate(['name' => 'view_users']);
        $editUsers = Permission::firstOrCreate(['name' => 'edit_users']);
        $deleteUsers = Permission::firstOrCreate(['name' => 'delete_users']);
        $assignRoles = Permission::firstOrCreate(['name' => 'assign_roles']);

        // Assign all permissions to superadmin
        $superadmin->permissions()->sync([$viewUsers->id, $editUsers->id, $deleteUsers->id, $assignRoles->id]);

        // Assign some to admin (e.g., view, edit, delete)
        $admin->permissions()->sync([$viewUsers->id, $editUsers->id, $deleteUsers->id]);

        // Assign view to manager
        $manager->permissions()->sync([$viewUsers->id]);

        // No permissions for cashier

        // Assign superadmin role to sundar user
        $user = User::where('email', 'sundar@sundar.com')->first();
        if ($user) {
            $user->roles()->sync($superadmin->id);
        }

        // Optionally assign roles to factory users
        $users = User::where('id', '>', 1)->get();
        $roles = [$admin->id, $cashier->id, $manager->id];
        foreach ($users as $u) {
            $u->roles()->attach($roles[array_rand($roles)]);
        }
    }
}
