<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // STEP 1: Update RMA to xxxxx.1 (only for pure numbers)
        DB::statement("
            UPDATE service_inwards
            SET rma = CONCAT(rma, '.1')
            WHERE rma NOT LIKE '%.%'
              AND rma REGEXP '^[0-9]+$'
        ");

        // STEP 2: Now update base_rma and sub_item from the NEW rma
        DB::statement("
            UPDATE service_inwards
            SET
                base_rma = CAST(SUBSTRING_INDEX(rma, '.', 1) AS UNSIGNED),
                sub_item = CAST(SUBSTRING_INDEX(rma, '.', -1) AS DECIMAL(10,2))
            WHERE rma LIKE '%.1'
              AND SUBSTRING_INDEX(rma, '.', -1) = '1'
        ");
    }

    public function down()
    {
        // Revert: remove .1 and reset
        DB::statement("
            UPDATE service_inwards
            SET
                rma = SUBSTRING_INDEX(rma, '.', 1),
                base_rma = 0,
                sub_item = 0
            WHERE rma LIKE '%.1'
        ");
    }
};
