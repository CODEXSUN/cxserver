<?php

namespace Database\Seeders;

use App\Models\ContactType;
use Illuminate\Database\Seeder;

class ContactTypeSeeder extends Seeder
{
    public function run(): void
    {
        $defaultTypes = [
            ['name' => 'Customer', 'description' => 'Regular customer', 'is_active' => true],
            ['name' => 'Vendor', 'description' => 'Supplier of goods/services', 'is_active' => true],
            ['name' => 'Partner', 'description' => 'Business partner', 'is_active' => true],
            ['name' => 'Employee', 'description' => 'Internal staff', 'is_active' => true],
            ['name' => 'Lead', 'description' => 'Potential customer', 'is_active' => true],
        ];

        foreach ($defaultTypes as $type) {
            ContactType::updateOrCreate(
                ['name' => $type['name']], // Use name as unique identifier
                $type
            );
        }
    }
}
