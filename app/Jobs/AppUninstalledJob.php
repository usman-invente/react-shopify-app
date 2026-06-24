<?php

namespace App\Jobs;

use Osiset\ShopifyApp\Actions\CancelCurrentPlan;
use Osiset\ShopifyApp\Contracts\Commands\Shop as IShopCommand;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;
use Osiset\ShopifyApp\Messaging\Events\AppUninstalledEvent;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;

class AppUninstalledJob extends \Osiset\ShopifyApp\Messaging\Jobs\AppUninstalledJob
{
    public function handle(
        IShopCommand $shopCommand,
        IShopQuery $shopQuery,
        CancelCurrentPlan $cancelCurrentPlanAction
    ): bool {
        $this->domain = ShopDomain::fromNative($this->domain);

        $shop = $shopQuery->getByDomain($this->domain);
        if (!$shop) {
            return true;
        }

        $shopId = $shop->getId();

        $cancelCurrentPlanAction($shopId);

        // Clean token/plan fields
        $shopCommand->clean($shopId);

        // Delete the shop model directly, bypassing the broken charges relation
        $shopModel = \App\Models\Shop::where('name', $this->domain->toNative())->first();
        if ($shopModel) {
            $shopModel->delete();
        }

        event(new AppUninstalledEvent($shop));

        return true;
    }
}
