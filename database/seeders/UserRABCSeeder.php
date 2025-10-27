<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRABCSeeder extends Seeder
{
    /**
     * Seed roles, permissions, users, and pivot tables.
     */
    public function run(): void
    {

        // ──────────────────────────────────────────────────────────────
        // 1. ROLES
        // ──────────────────────────────────────────────────────────────
        $roleData = [
            'admin'   => 'Full system access',
            'manager' => 'Can manage users and view reports',
            'user'    => 'Standard authenticated user',
            'client'  => 'External client access',
            'dealer'  => 'Dealer/partner portal access',
            'guest'   => 'Limited read-only access',
            'devops'  => 'Devops access',
        ];

        $roles = [];
        foreach ($roleData as $name => $desc) {
            $role = Role::updateOrCreate(
                ['name' => $name],
                ['description' => $desc]
            );
            $roles[$name] = $role;
        }

        // ──────────────────────────────────────────────────────────────
        // 2. PERMISSIONS
        // ──────────────────────────────────────────────────────────────
        $permissionData = [
            // Contacts
            'viewAny contacts'   => 'View list of contacts',
            'view contacts'      => 'View a single contact',
            'create contacts'    => 'Create new contact',
            'update contacts'    => 'Update existing contact',
            'delete contacts'    => 'Soft delete contact',
            'restore contacts'   => 'Restore deleted contact',

            // Users
            'viewAny users'      => 'View list of users',
            'view users'         => 'View a single user',
            'create users'       => 'Create new user',
            'update users'       => 'Update existing user',
            'delete users'       => 'Delete user',
            'manage roles'       => 'Assign roles to users',

            // Products
            'viewAny products'   => 'View product list',
            'view products'      => 'View product details',
            'create products'    => 'Add new product',
            'update products'    => 'Edit product',
            'delete products'    => 'Remove product',

            // Reports
            'view reports'       => 'Access analytics & reports',
            'export data'        => 'Export data to CSV/PDF',

            // System
            'manage settings'    => 'Change system configuration',
        ];

        $permissions = [];
        foreach ($permissionData as $name => $desc) {
            $perm = Permission::updateOrCreate(
                ['name' => $name],
                ['description' => $desc]
            );
            $permissions[$name] = $perm;
        }

        // ──────────────────────────────────────────────────────────────
        // 3. PERMISSION → ROLE (permission_role pivot)
        // ──────────────────────────────────────────────────────────────
        $rolePermissions = [
            'admin'   => array_keys($permissionData), // ALL
            'devops'  => array_keys($permissionData), // ALL

            'manager' => [
                'viewAny contacts', 'view contacts', 'create contacts', 'update contacts',
                'viewAny users', 'view users',
                'viewAny products', 'view products',
                'view reports',
            ],

            'user' => [
                'viewAny contacts', 'view contacts', 'create contacts', 'update contacts',
                'viewAny products', 'view products',
            ],

            'client' => ['view contacts', 'view products'],
            'dealer' => ['viewAny products', 'view products', 'view contacts'],
            'guest'  => ['view products'],
        ];

        foreach ($rolePermissions as $roleName => $permNames) {
            if (isset($roles[$roleName])) {
                $permIds = collect($permNames)
                    ->map(fn($n) => $permissions[$n]->id ?? null)
                    ->filter()
                    ->values()
                    ->toArray();

                $roles[$roleName]->permissions()->sync($permIds);
            }
        }

        // ──────────────────────────────────────────────────────────────
        // 4. USERS + ROLE → USER (role_user pivot)
        // ──────────────────────────────────────────────────────────────
        $userData = [
            ['Sundar',      'sundar@sundar.com',     'Kalarani1',   ['admin']],
            ['Admin',       'admin@admin.com',       'Password1',   ['admin']],
            ['Demo',        'demo@demo.com',         'Password1',   ['admin']],
            ['Manager',     'manager@manager.com',   'Password1',   ['manager']],
            ['User',        'user@user.com',         'Password1',   ['user']],
            ['Client',      'client@client.com',     'Password1',   ['client']],
            ['Dealer',      'dealer@dealer.com',     'Password1',   ['dealer']],
            ['DevOps',      'devops@codexsun.com',   'DevOps123!',  ['devops']],
        ];

        foreach ($userData as [$name, $email, $pass, $roleNames]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name'     => $name,
                    'password' => Hash::make($pass),
                    'active'   => true,
                ]
            );

            $roleIds = collect($roleNames)
                ->map(fn($n) => $roles[$n]->id ?? null)
                ->filter()
                ->values()
                ->toArray();

            $user->roles()->sync($roleIds);
        }
    }
}
