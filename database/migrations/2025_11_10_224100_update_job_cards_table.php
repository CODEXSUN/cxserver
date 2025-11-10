<?php
// database/migrations/2025_11_10_224100_update_job_cards_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add columns as NULLABLE first
        Schema::table('job_cards', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id');
            $table->foreignId('entry_by')->nullable()->after('user_id');
            $table->renameColumn('final_status', 'remarks');
        });

        // Step 3: Backfill existing records
        DB::table('job_cards')->update([
            'user_id' => '1',
            'entry_by' => '1',
        ]);
    }

    public function down(): void
    {
        Schema::table('job_cards', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['entry_by']);
            $table->dropColumn(['user_id', 'entry_by']);
            $table->renameColumn('remarks', 'final_status');
        });
    }
};
