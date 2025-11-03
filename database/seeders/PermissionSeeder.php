<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    private array $permissions = [];

    private array $globalCrudModules = [
        'blog', 'user', 'category', 'tag', 'comment', 'media', 'contact', 'contact-type'
        // add new modules here
    ];

    private array $systemPermissions = [
        'settings.manage'   => ['label' => 'Manage Settings',       'description' => 'Full control over application settings.'],
        'role.manage'       => ['label' => 'Manage Roles',          'description' => 'Create / edit / delete roles.'],
        'permission.manage' => ['label' => 'Manage Permissions',   'description' => 'Create / edit / delete permissions.'],
        'dashboard.access'  => ['label' => 'Access Dashboard',      'description' => 'Allows entry to admin dashboard.'],
    ];

    public function run(): void
    {
        $guard = 'web';

        $this->generateCrudPermissions();
        $this->permissions = array_merge($this->permissions, $this->systemPermissions);

        $count = 0;
        foreach ($this->permissions as $name => $data) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => $guard],
                ['label' => $data['label'], 'description' => $data['description']]
            );
            $count++;
        }

        $this->command->info("Permissions seeded: {$count} total");
    }

    private function generateCrudPermissions(): void
    {
        $actions = [
            'create'  => 'Create',
            'read'    => 'Read',
            'update'  => 'Update',
            'delete'  => 'Delete',
            'restore' => 'Restore',
            'list'    => 'List',
        ];

        foreach ($this->globalCrudModules as $module) {
            foreach ($actions as $action => $label) {
                $name = "{$module}.{$action}";
                $this->permissions[$name] = [
                    'label'       => "{$label} " . ucfirst($module) . 's',
                    'description' => "Allows {$action}ing {$module}s"
                        . ($action === 'restore' ? ' (soft-deleted)' : '') . '.',
                ];
            }
        }
    }
}
