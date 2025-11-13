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
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('position')->default(0); // Drag-to-reorder
            $table->foreignId('user_id')->constrained('users'); // Creator
            $table->foreignId('assignee_id')->nullable()->constrained('users'); // Assigned to
            $table->string('visibility')->default('personal'); // personal, work, public, custom
            $table->string('priority')->default('medium'); // low, medium, high
            $table->dateTime('due_date')->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'visibility']);
            $table->index(['assignee_id']);
            $table->index('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
