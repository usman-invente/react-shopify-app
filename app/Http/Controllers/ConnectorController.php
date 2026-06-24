<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Osiset\ShopifyApp\Contracts\Commands\Shop as IShopCommand;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;

class ConnectorController extends Controller
{
    public function index(): Response
    {
        $shop = $this->getConnectedShop();

        return Inertia::render('Connector', [
            'connectedShop' => $shop ? [
                'name' => $shop->name,
            ] : null,
        ]);
    }

    public function uninstall(IShopCommand $shopCommand, IShopQuery $shopQuery): JsonResponse
    {
        $shop = $this->getConnectedShop();

        if (!$shop) {
            return response()->json(['error' => 'No connected store found'], 422);
        }

        // Clean token/plan via package command, then delete the shop record directly
        // (bypassing shopCommand->softDelete which requires a charges.shop_id column)
        $shopDomain = ShopDomain::fromNative($shop->name);
        $shopRecord = $shopQuery->getByDomain($shopDomain);

        if ($shopRecord) {
            $shopId = $shopRecord->getId();
            $shopCommand->clean($shopId);
        }

        // Delete directly on the model to avoid the broken charges relation
        $shop->delete();

        Log::info('Shop uninstalled', ['shop' => $shop->name]);

        return response()->json(['success' => true]);
    }

    private function getConnectedShop(): ?Shop
    {
        $user = Auth::user();

        if ($user instanceof Shop) {
            return $user;
        }

        return Shop::where('name', 'like', '%myshopify.com')
            ->where('password', '!=', '')
            ->orderBy('id', 'desc')
            ->first();
    }
}
