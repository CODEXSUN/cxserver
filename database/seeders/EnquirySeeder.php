<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Enquiry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EnquirySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure contacts exist
        if (Contact::count() === 0) {
            $this->command->warn('No contacts found. Run ContactSeeder first!');
            return;
        }

        $enquiries = [
            // Customer: Rahul Sharma (CUST-0001)
            [
                'contact_code' => 'CUST-0001',
                'query' => 'I need a detailed quotation for 200 units of LED bulbs with GST breakdown.',
                'status' => 'open',
            ],
            [
                'contact_code' => 'CUST-0001',
                'query' => 'Follow-up on previous quotation. Can you offer 10% discount for bulk?',
                'status' => 'in_progress',
            ],

            // Customer: Priya Patel (CUST-0002)
            [
                'contact_code' => 'CUST-0002',
                'query' => 'Looking for eco-friendly packaging options for 500 gift boxes.',
                'status' => 'open',
            ],

            // Customer: Amit Kumar (CUST-0003) – no email
            [
                'contact_code' => 'CUST-0003',
                'query' => 'What is the warranty period for your power tools?',
                'status' => 'resolved',
                'resolved_at' => now()->subDays(3),
            ],

            // Supplier: Tech Distributors (SUPP-0001)
            [
                'contact_code' => 'SUPP-0001',
                'query' => 'Can you supply 1000 USB-C cables by next week? Need sample first.',
                'status' => 'in_progress',
            ],

            // Both: Sunrise Enterprises (BOTH-0001)
            [
                'contact_code' => 'BOTH-0001',
                'query' => 'Interested in becoming a reseller. Please send catalog and MOQ.',
                'status' => 'open',
            ],
            [
                'contact_code' => 'BOTH-0001',
                'query' => 'Payment for invoice #INV-2025-001 has been made via NEFT.',
                'status' => 'closed',
                'resolved_at' => now()->subDays(7),
            ],

            // Inactive Contact (should still allow enquiry)
            [
                'contact_code' => 'CUST-0004',
                'query' => 'Old customer checking if account can be reactivated.',
                'status' => 'open',
            ],
        ];

        foreach ($enquiries as $data) {
            $contact = Contact::where('contact_code', $data['contact_code'])->first();

            if ($contact) {
                Enquiry::create([
                    'contact_id' => $contact->id,
                    'query' => $data['query'],
                    'status' => $data['status'] ?? 'open',
                    'resolved_at' => $data['resolved_at'] ?? null,
                ]);
            }
        }

        $this->command->info('EnquirySeeder completed: ' . count($enquiries) . ' enquiries seeded.');
    }
}
