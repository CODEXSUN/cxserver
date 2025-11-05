<?php

namespace Database\Seeders;

use App\Models\ServiceStatus;
use Illuminate\Database\Seeder;

class ServiceStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            'Received',
            'Diagnosed',
            'In Repair',
            'Testing',
            'Ready for Delivery',
            'Delivered',
            'Cancelled',
            'On Hold',
        ];

        foreach ($statuses as $name) {
            ServiceStatus::firstOrCreate(['name' => $name]);
        }
    }
}
