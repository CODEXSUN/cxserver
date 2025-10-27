<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks for clean seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate table
        Contact::truncate();

        // Sample Customers
        Contact::create([
            'contact_code' => 'CUST-0001',
            'name' => 'Rahul Sharma',
            'phone' => '+919876543210',
            'email' => 'rahul.sharma@example.com',
            'contact_type' => 'customer',
            'has_account' => true,
            'status' => 'active',
        ]);

        Contact::create([
            'contact_code' => 'CUST-0002',
            'name' => 'Priya Patel',
            'phone' => '+919988776655',
            'email' => 'priya.patel@example.com',
            'contact_type' => 'customer',
            'has_account' => false,
            'status' => 'active',
        ]);

        Contact::create([
            'contact_code' => 'CUST-0003',
            'name' => 'Amit Kumar',
            'phone' => '+919123456789',
            'email' => null,
            'contact_type' => 'customer',
            'has_account' => false,
            'status' => 'active',
        ]);

        // Sample Suppliers
        Contact::create([
            'contact_code' => 'SUPP-0001',
            'name' => 'Tech Distributors Ltd',
            'phone' => '+918800112233',
            'email' => 'sales@techdist.com',
            'contact_type' => 'supplier',
            'has_account' => true,
            'status' => 'active',
        ]);

        Contact::create([
            'contact_code' => 'SUPP-0002',
            'name' => 'Global Traders',
            'phone' => '+919445566778',
            'email' => 'info@globaltraders.in',
            'contact_type' => 'supplier',
            'has_account' => false,
            'status' => 'active',
        ]);

        // Sample Both (Customer + Supplier)
        Contact::create([
            'contact_code' => 'BOTH-0001',
            'name' => 'Sunrise Enterprises',
            'phone' => '+917788990011',
            'email' => 'accounts@sunriseent.com',
            'contact_type' => 'both',
            'has_account' => true,
            'status' => 'active',
        ]);

        // Inactive contact for testing
        Contact::create([
            'contact_code' => 'CUST-0004',
            'name' => 'Old Customer',
            'phone' => '+919001122334',
            'email' => 'old@example.com',
            'contact_type' => 'customer',
            'has_account' => false,
            'status' => 'inactive',
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('ContactSeeder completed: 7 contacts seeded.');
    }
}
