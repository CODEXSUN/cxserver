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
        Schema::create('job_spare_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_part_id')->constrained('service_parts');
            $table->integer('qty_requested');
            $table->integer('qty_issued')->default(0);
            $table->enum('status', ['pending','issued','customer_will_bring','cancelled'])
                ->default('pending');
            $table->dateTime('requested_at')->useCurrent();
            $table->foreignId('user_id')->references('id')->on('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_spare_requests');
    }
};
