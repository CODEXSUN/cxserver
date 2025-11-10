<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_inward_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_inward_id')
                ->constrained('service_inwards')
                ->onDelete('cascade');
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->text('note');
            $table->boolean('is_reply')->default(false);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();

            // Index for fast threading
            $table->index(['service_inward_id', 'created_at']);
            $table->index('parent_id');

            // Foreign key for threaded replies
            $table->foreign('parent_id')
                ->references('id')
                ->on('service_inward_notes')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_inward_notes');
    }
};
