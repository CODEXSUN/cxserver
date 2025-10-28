<?php
// database/seeders/EnquiryRABCSeeder.php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ProjectCategoryRABCSeeder extends Seeder
{
    /**
     * Seed Enquiry-related permissions and assign to roles.
     */
    public function run(): void
    {
        // ──────────────────────────────────────────────────────────────
        // 1. ENQUIRY PERMISSIONS
        // ──────────────────────────────────────────────────────────────
        $enquiryPermissions = [
            'viewAny project categories'          => 'View list of project categories',
            'view project categories'             => 'View a single project categories',
            'create project categories'           => 'Create new project categories',
            'update project categories'           => 'Update existing project categories',
            'delete project categories'           => 'Soft delete project categories',
            'restore project categories'          => 'Restore deleted project categories',
        ];

        $permissions = [];
        foreach ($enquiryPermissions as $name => $desc) {
            $perm = Permission::updateOrCreate(
                ['name' => $name],
                ['description' => $desc]
            );
            $permissions[$name] = $perm;
        }

        // ──────────────────────────────────────────────────────────────
        // 2. GET ROLES (Assume roles already exist from UserRABCSeeder)
        // ──────────────────────────────────────────────────────────────
        $roles = Role::whereIn('name', ['admin', 'manager', 'user', 'restricted'])->get()->keyBy('name');

        if ($roles->isEmpty()) {
            $this->command->warn('No roles found. Run UserRABCSeeder first.');
            return;
        }

        // ──────────────────────────────────────────────────────────────
        // 3. ASSIGN PERMISSIONS TO ROLES
        // ──────────────────────────────────────────────────────────────
        $roleAssignments = [
            'admin' => array_keys($enquiryPermissions), // ALL

            'manager' => [
                'viewAny project categories',
                'view project categories',
                'create project categories',
                'update project categories',
            ],

            'user' => [
                'viewAny  project categories',
                'view  project categories',
                'create  project categories',
            ],

            'restricted' => [], // No access
        ];

        foreach ($roleAssignments as $roleName => $permNames) {
            if (!isset($roles[$roleName])) {
                continue;
            }

            $permIds = collect($permNames)
                ->map(fn($n) => $permissions[$n]->id ?? null)
                ->filter()
                ->values()
                ->toArray();

            $roles[$roleName]->permissions()->syncWithoutDetaching($permIds);
        }

        $this->command->info(' project categories permissions seeded and assigned successfully!');
    }
}
