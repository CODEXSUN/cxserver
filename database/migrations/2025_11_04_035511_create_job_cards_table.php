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
        Schema::create('job_cards', function (Blueprint $table) {
            $table->id();
            $table->string('job_no')->unique();
            $table->foreignId('service_material_id')->references('id')->on('service_materials');
            $table->foreignId('contact_id')->references('id')->on('contacts');
            $table->dateTime('received_at');
            $table->foreignId('service_status_id')->references('id')->on('service_statuses');
            $table->text('diagnosis')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('advance_paid', 10, 2)->default(0);
            $table->decimal('final_bill', 10, 2)->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->timestamps();

            $table->index('job_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_cards');
    }
};
