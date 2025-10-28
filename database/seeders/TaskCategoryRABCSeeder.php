<?php
// database/seeders/EnquiryRABCSeeder.php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class TaskCategoryRABCSeeder extends Seeder
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
            'viewAny task categories'          => 'View list of task categories',
            'view task categories'             => 'View a single task categories',
            'create task categories'           => 'Create new task categories',
            'update task categories'           => 'Update existing task categories',
            'delete task categories'           => 'Soft delete task categories',
            'restore task categories'          => 'Restore deleted task categories',
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
                'viewAny task categories',
                'view task categories',
                'create task categories',
                'update task categories',
            ],

            'user' => [
                'viewAny  task categories',
                'view  task categories',
                'create  task categories',
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

        $this->command->info(' task categories permissions seeded and assigned successfully!');
    }
}
