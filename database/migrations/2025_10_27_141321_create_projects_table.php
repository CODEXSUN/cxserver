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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquiry_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('project_categories')->onDelete('set null');
            $table->string('project_code')->unique()->index();
            $table->longText('title');
            $table->decimal('estimated_value', 12, 2)->default(0);
            $table->decimal('billed_amount', 12, 2)->default(0);
            $table->boolean('is_billable')->default(true);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'billed', 'closed'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('billed_at')->nullable();
            $table->json('tags')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'is_billable', 'category_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
