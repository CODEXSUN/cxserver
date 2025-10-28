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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_task_id')->nullable()->constrained('tasks')->onDelete('set null');
            $table->foreignId('task_category_id')->nullable()->constrained('task_categories')->onDelete('set null'); // ← NEW
            $table->string('task_code')->unique()->index();
            $table->longText('title');
            $table->decimal('task_value', 10, 2)->default(0);
            $table->boolean('is_billable')->default(true);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->timestamp('due_date')->nullable();
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'review', 'completed', 'rejected'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('tags')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(
                ['status', 'priority', 'due_date', 'parent_task_id', 'task_category_id'],
                'tasks_status_priority_idx'
            );

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
