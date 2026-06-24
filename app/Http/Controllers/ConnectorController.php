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

        if (!$shop->password) {
            return response()->json(['error' => 'Store is not authenticated with Shopify'], 422);
        }

        $shopName = $shop->name;

        try {
            $this->uninstallFromShopify($shop);
        } catch (\Throwable $e) {
            Log::error('Failed to uninstall app from Shopify store', [
                'shop' => $shopName,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Could not remove the app from your Shopify store. Please try again.',
            ], 500);
        }

        $shop->refresh();

        $shopDomain = ShopDomain::fromNative($shopName);
        $shopRecord = $shopQuery->getByDomain($shopDomain);

        if ($shopRecord) {
            $shopCommand->clean($shopRecord->getId());
        }

        $shop->delete();

        Log::info('Shop uninstalled from store and local database', ['shop' => $shopName]);

        return response()->json(['success' => true]);
    }

    private function uninstallFromShopify(Shop $shop): void
    {
        $lastException = null;

        for ($attempt = 0; $attempt < 2; $attempt++) {
            try {
                $shop->refresh();
                $shop->refreshOfflineAccessTokenIfNeeded();
                $shop->resetApiClient();

                $response = $shop->api()->graph(<<<'GRAPHQL'
                mutation {
                    appUninstall {
                        app {
                            id
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }
                GRAPHQL);

                $body = $this->normalizeGraphBody($response);
                $errors = $body['errors'] ?? [];
                $userErrors = data_get($body, 'data.appUninstall.userErrors', []);

                if ($this->isAlreadyUninstalledError($errors, $userErrors)) {
                    return;
                }

                if (!empty($errors) || !empty($userErrors)) {
                    throw new \RuntimeException(json_encode([
                        'errors' => $errors,
                        'userErrors' => $userErrors,
                    ]));
                }

                return;
            } catch (\Throwable $e) {
                $lastException = $e;

                Log::warning('Shopify uninstall attempt failed', [
                    'shop' => $shop->name,
                    'attempt' => $attempt + 1,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        throw $lastException ?? new \RuntimeException('Uninstall failed');
    }

    private function normalizeGraphBody(mixed $response): array
    {
        if (is_object($response) && method_exists($response, 'toArray')) {
            $response = $response->toArray();
        } elseif (is_object($response)) {
            $response = json_decode(json_encode($response), true);
        }

        $body = is_array($response) ? ($response['body'] ?? []) : [];

        if (is_object($body)) {
            $body = json_decode(json_encode($body), true);
        }

        return is_array($body) ? $body : [];
    }

    /**
     * @param  array<int, mixed>  $errors
     * @param  array<int, mixed>  $userErrors
     */
    private function isAlreadyUninstalledError(array $errors, array $userErrors): bool
    {
        $messages = strtolower(collect($errors)->pluck('message')
            ->merge(collect($userErrors)->pluck('message'))
            ->implode(' '));

        return str_contains($messages, 'not installed')
            || str_contains($messages, 'already uninstalled');
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
