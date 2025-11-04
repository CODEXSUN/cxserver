<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_part_id')->constrained('service_parts');
            $table->integer('qty');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            $table->enum('status', ['pending','ordered','received','cancelled'])->default('pending');
            $table->dateTime('requested_at')->useCurrent();
            $table->dateTime('ordered_at')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};
