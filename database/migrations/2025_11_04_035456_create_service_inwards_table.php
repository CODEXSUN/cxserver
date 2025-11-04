<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_inwards', function (Blueprint $table) {
            $table->id();
            $table->string('rma')->unique();
            $table->foreignId('contact_id')->references('id')->on('contacts');
            $table->string('material_type'); // laptop, desktop, printer
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_no')->unique()->nullable();
            $table->text('passwords')->nullable();
            $table->string('photo_url')->nullable();
            $table->longText('observation')->nullable();
            $table->foreignId('received_by')->nullable();
            $table->dateTime('received_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_inwards');
    }
};
