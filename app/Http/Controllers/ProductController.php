<?php

namespace App\Http\Controllers;

use App\Exceptions\ShopifyApiException;
use App\Services\ShopifyProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Fetch products from Shopify
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                Log::warning('Unauthorized product fetch attempt');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $shop = null;

            if ($user instanceof \App\Models\Shop) {
                $shop = $user;
            } elseif (method_exists($user, 'shop') && $user->shop) {
                $shop = $user->shop;
            } else {
                $shop = \App\Models\Shop::where('shopify_offline_refresh_token', '!=', null)
                    ->orWhere('password', '!=', null)
                    ->first();
            }

            if (!$shop) {
                return response()->json([
                    'error' => 'No Shopify store connected. Go to Connector to link your store.',
                ], 422);
            }

            if (!$shop->password) {
                return response()->json([
                    'error' => 'Shopify store not properly authenticated. Try connecting again.',
                ], 422);
            }

            $service = new ShopifyProductService($shop);
            $products = $service->getProducts();

            return response()->json(['products' => $products->toArray()]);
        } catch (ShopifyApiException $e) {
            Log::error('Shopify API error', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json(['error' => 'Failed to fetch products: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error('Unexpected error in ProductController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'An unexpected error occurred: ' . $e->getMessage()], 500);
        }
    }
}
