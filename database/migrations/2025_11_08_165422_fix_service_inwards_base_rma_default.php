<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('service_inwards', function (Blueprint $table) {
            $table->unsignedInteger('base_rma')->default(0)->change();
            $table->decimal('sub_item', 10, 2)->default(0)->change();
        });
    }

    public function down()
    {
        Schema::table('service_inwards', function (Blueprint $table) {
            $table->unsignedInteger('base_rma')->change();
            $table->decimal('sub_item', 10, 2)->change();
        });
    }
};
