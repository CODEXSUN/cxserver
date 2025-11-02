<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeedercopy extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    /** @var array<string,array{label:string,description:string}> */
    private array $permissions = [
        // ────── Post module ──────
        'post.create' => [
            'label'       => 'Create Posts',
            'description' => 'Allows creating new posts.',
        ],
        'post.read' => [
            'label'       => 'Read Posts',
            'description' => 'Allows viewing any post.',
        ],
        'post.update' => [
            'label'       => 'Update Posts',
            'description' => 'Allows editing existing posts.',
        ],
        'post.delete' => [
            'label'       => 'Delete Posts',
            'description' => 'Allows permanent deletion of posts.',
        ],

        // ────── User module ──────
        'user.create' => [
            'label'       => 'Create Users',
            'description' => 'Allows registering new users.',
        ],
        'user.read' => [
            'label'       => 'Read Users',
            'description' => 'Allows viewing user profiles.',
        ],
        'user.update' => [
            'label'       => 'Update Users',
            'description' => 'Allows editing user data.',
        ],
        'user.delete' => [
            'label'       => 'Delete Users',
            'description' => 'Allows removing users.',
        ],

        // ────── System ──────
        'settings.manage' => [
            'label'       => 'Manage Settings',
            'description' => 'Full control over application settings.',
        ],
        'role.manage' => [
            'label'       => 'Manage Roles',
            'description' => 'Create / edit / delete roles.',
        ],
        'permission.manage' => [
            'label'       => 'Manage Permissions',
            'description' => 'Create / edit / delete permissions.',
        ],

        // ────── add more permissions here ──────
    ];

    public function run(): void
    {
        $guard = 'web';

        foreach ($this->permissions as $name => $data) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => $guard],
                [
                    'label'       => $data['label'],
                    'description' => $data['description'],
                ]
            );
        }

        $this->command->info('Permissions seeded (' . count($this->permissions) . ')');
    }
}
