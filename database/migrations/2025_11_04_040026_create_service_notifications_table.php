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
        Schema::create('service_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('channel'); // sms, whatsapp, email
            $table->string('to'); // phone/email
            $table->text('message');
            $table->boolean('sent')->default(false);
            $table->dateTime('sent_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_notifications');
    }
};
