<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Shop;
use App\Models\User;

class CheckShops extends Command
{
    protected $signature = 'app:check-shops';

    public function handle()
    {
        $this->info('=== Users ===');
        User::all()->each(fn($u) => $this->line("ID: {$u->id}, Name: {$u->name}, Email: {$u->email}"));

        $this->info("\n=== Shops ===");
        Shop::all()->each(function($shop) {
            $this->line("ID: {$shop->id}, Name: {$shop->name}, Email: {$shop->email}");
            $this->line("  Has token: " . ($shop->password ? 'YES (' . strlen($shop->password) . ' chars)' : 'NO'));
            $this->line("  Has offline refresh token: " . ($shop->shopify_offline_refresh_token ? 'YES' : 'NO'));
        });
    }
}
