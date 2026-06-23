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
            $shop = Auth::user();

            if (!$shop) {
                Log::warning('Unauthorized product fetch attempt');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Use service to fetch products
            $service = new ShopifyProductService($shop);
            $products = $service->getProducts();

            return response()->json(['products' => $products->toArray()]);
        } catch (ShopifyApiException $e) {
            Log::error('Shopify API error', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json(['error' => 'Failed to fetch products'], 500);
        } catch (\Exception $e) {
            Log::error('Unexpected error in ProductController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
}
