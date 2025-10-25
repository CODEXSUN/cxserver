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
        // Roles
        $admin = Role::create(['name' => 'admin']);
        $editor = Role::create(['name' => 'editor']);

        // Permissions
        $viewPosts = Permission::create(['name' => 'view_posts']);
        $editPosts = Permission::create(['name' => 'edit_posts']);

        // Assign permissions to roles
        $admin->permissions()->attach([$viewPosts->id, $editPosts->id]);
        $editor->permissions()->attach($viewPosts->id);

        // Assign role to a user (assuming user ID 1 exists)
        $user = User::find(1);
        $user->roles()->attach($admin->id);
    }
}
