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
        Schema::create('job_cards', function (Blueprint $table) {
            $table->id();
            $table->string('job_no')->unique(); // JOB-202511001
            $table->foreignId('service_material_id')->constrained('service_material')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('contacts')->cascadeOnDelete();
            $table->dateTime('received_at');
            $table->enum('status', [
                'received','diagnosed','spares_pending','waiting_customer_spare',
                'allocated_engineer','in_progress','outside_repair','qc_passed',
                'ready_to_deliver','delivered','cancelled'
            ])->default('received');
            $table->text('diagnosis')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('advance_paid', 10, 2)->default(0);
            $table->decimal('final_bill', 10, 2)->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('job_no');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_cards');
    }
};
