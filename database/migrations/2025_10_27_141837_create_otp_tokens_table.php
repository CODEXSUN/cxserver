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
        Schema::create('otp_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('action');
            $table->string('token', 6)->index();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['tokenable_type', 'tokenable_id', 'action', 'expires_at']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otp_tokens');
    }
};
