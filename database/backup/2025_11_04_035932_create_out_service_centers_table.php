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
        Schema::create('out_service_centers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->constrained()->cascadeOnDelete();
            $table->string('lab_name');
            $table->dateTime('sent_at');
            $table->date('expected_back')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->dateTime('received_back_at')->nullable();
            $table->enum('status', ['sent','in_progress','returned'])->default('sent');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique('job_card_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('out_service_centers');
    }
};
