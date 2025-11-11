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
        Schema::create('ready_for_delivery_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ready_for_delivery_id')->constrained('ready_for_deliveries');
            $table->foreignId('user_id')->constrained('users');
            $table->text('note')->nullable();
            $table->boolean('is_reply')->default(false);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();

            // Index for fast threading
            $table->index(['ready_for_delivery_id', 'created_at']);
            $table->index('parent_id');

            // Foreign key for threaded replies
            $table->foreign('parent_id')->references('id')->on('ready_for_delivery_notes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ready_for_delivery_notes');
    }
};
