<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add nullable columns first
        Schema::table('service_inwards', function ($table) {
            $table->unsignedInteger('base_rma')->nullable()->after('rma');
            $table->decimal('sub_item', 10, 2)->nullable()->after('base_rma');
        });

        // Step 2: Populate data
        DB::statement("
            UPDATE service_inwards
            SET
                base_rma = CAST(SUBSTRING_INDEX(rma, '.', 1) AS UNSIGNED),
                sub_item = CASE
                    WHEN LOCATE('.', rma) > 0
                    THEN CAST(SUBSTRING(rma, LOCATE('.', rma) + 1) AS DECIMAL(10,2))
                    ELSE 0
                END
        ");

        // Step 3: Convert to STORED generated columns + index
        Schema::table('service_inwards', function ($table) {
            // Drop temporary columns
            $table->dropColumn(['base_rma', 'sub_item']);

            // Re-add as STORED generated columns
            $table->unsignedInteger('base_rma')->stored()->after('rma');
            $table->decimal('sub_item', 10, 2)->stored()->after('base_rma');

            // Trigger re-calculation via dummy update
            DB::statement("
                UPDATE service_inwards
                SET base_rma = base_rma, sub_item = sub_item
            ");

            // Add index
            $table->index(['base_rma', 'sub_item'], 'idx_rma_sort');
        });
    }

    public function down(): void
    {
        Schema::table('service_inwards', function ($table) {
            $table->dropIndex('idx_rma_sort');
            $table->dropColumn(['base_rma', 'sub_item']);
        });
    }
};
