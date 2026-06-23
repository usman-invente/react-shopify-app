<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('password', 255)->nullable();
            $table->rememberToken();
            $table->boolean('shopify_grandfathered')->default(false);
            $table->string('shopify_namespace')->nullable();
            $table->boolean('shopify_freemium')->default(false);
            $table->unsignedInteger('plan_id')->nullable();
            $table->timestamp('password_updated_at')->nullable();
            $table->unsignedInteger('theme_support_level')->nullable();
            $table->text('shopify_offline_refresh_token')->nullable();
            $table->timestamp('shopify_offline_access_token_expires_at')->nullable();
            $table->timestamp('shopify_offline_refresh_token_expires_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
