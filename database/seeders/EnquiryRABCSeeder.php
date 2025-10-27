<?php
// database/seeders/EnquiryRABCSeeder.php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class EnquiryRABCSeeder extends Seeder
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
            'viewAny enquiries'          => 'View list of enquiries',
            'view enquiries'             => 'View a single enquiry',
            'create enquiries'           => 'Create new enquiry',
            'update enquiries'           => 'Update existing enquiry',
            'delete enquiries'           => 'Soft delete enquiry',
            'restore enquiries'          => 'Restore deleted enquiry',
            'resolve enquiries'          => 'Mark enquiry as resolved',
            'convert enquiry to project' => 'Convert enquiry to project'
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
                'viewAny enquiries',
                'view enquiries',
                'create enquiries',
                'update enquiries',
                'resolve enquiries',
                'convert enquiry to project',
            ],

            'user' => [
                'viewAny enquiries',
                'view enquiries',
                'create enquiries',
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

        $this->command->info('Enquiry permissions seeded and assigned successfully!');
    }
}
