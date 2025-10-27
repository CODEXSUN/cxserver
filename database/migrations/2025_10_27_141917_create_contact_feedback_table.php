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
        Schema::create('contact_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('rating')->unsigned()->nullable();
            $table->text('comments')->nullable();
            $table->boolean('would_recommend')->nullable();
            $table->timestamp('feedback_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_feedback');
    }
};
