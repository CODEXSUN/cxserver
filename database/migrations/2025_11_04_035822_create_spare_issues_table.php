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
        Schema::create('spare_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_spare_request_id')->constrained('job_spare_requests')->cascadeOnDelete();
            $table->integer('qty');
            $table->dateTime('issued_at')->useCurrent();
            $table->foreignId('issued_by')->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_issues');
    }
};
