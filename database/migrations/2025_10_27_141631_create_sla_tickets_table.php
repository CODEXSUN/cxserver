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
        Schema::create('sla_tickets', function (Blueprint $table) {
            $table->id();
            $table->morphs('ticketable');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('contact_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['response', 'resolution'])->default('response');
            $table->integer('time_limit_minutes')->default(1440);
            $table->timestamp('due_at')->nullable();
            $table->enum('status', ['active', 'met', 'breached', 'cancelled'])->default('active');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['ticketable_type', 'ticketable_id', 'status', 'due_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sla_tickets');
    }
};
