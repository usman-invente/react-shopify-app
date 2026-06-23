<?php

namespace App\Providers;

use App\Actions\InstallShop;
use App\Models\Shop;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Osiset\ShopifyApp\Actions\InstallShop as PackageInstallShop;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // IframeProtection caches Shop models; the class must exist before cache unserialize.
        class_exists(Shop::class);

        $this->app->bind(PackageInstallShop::class, InstallShop::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
