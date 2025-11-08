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
        Schema::create('job_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->references('id')->on('job_cards');
            $table->foreignId('user_id')->references('id')->on('users');
            $table->dateTime('assigned_at');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->integer('time_spent_minutes')->default(0);
            $table->longText('report')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('service_status_id')->references('id')->on('service_statuses');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['job_card_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_assignments');
    }
};
