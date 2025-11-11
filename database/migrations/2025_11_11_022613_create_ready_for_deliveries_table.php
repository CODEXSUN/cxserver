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
        Schema::create('ready_for_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->constrained('job_cards');
            $table->foreignId('user_id')->constrained('users');
            $table->text('engineer_note')->nullable();
            $table->text('future_note')->nullable();
            $table->text('billing_details')->nullable();
            $table->decimal('billing_amount',13,2)->default('0.00');
            $table->dateTime('delivered_confirmed_at')->nullable();
            $table->string('delivered_confirmed_by')->nullable();
            $table->string('delivered_otp')->nullable();
            $table->foreignId('service_status_id')->constrained('service_statuses');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ready_for_deliveries');
    }
};
