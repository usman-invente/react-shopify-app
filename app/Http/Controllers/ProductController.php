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

            if ($user instanceof \App\Models\Shop) {
                $shop = $user;
            } else {
                $shop = \App\Models\Shop::where('name', 'like', '%myshopify.com')
                    ->where('password', '!=', '')
                    ->orderBy('id', 'desc')
                    ->first();
            }

            if (!$shop) {
                return response()->json([
                    'error' => 'No Shopify store connected. Go to Connector to link your store.',
                ], 422);
            }

            if (!$shop->password) {
                return response()->json([
                    'error' => 'Shopify store not properly authenticated. Try connecting again on Connector page.',
                ], 422);
            }

            Log::info('Fetching products for shop', ['shop_id' => $shop->id, 'shop_name' => $shop->name]);

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

    public function update(string $productId): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $shop = null;

            if ($user instanceof \App\Models\Shop) {
                $shop = $user;
            } else {
                $shop = \App\Models\Shop::where('name', 'like', '%myshopify.com')
                    ->where('password', '!=', '')
                    ->orderBy('id', 'desc')
                    ->first();
            }

            if (!$shop) {
                return response()->json(['error' => 'No Shopify store connected'], 422);
            }

            Log::info('Update request received', [
                'product_id' => $productId,
                'has_files' => count(request()->files->all()),
                'all_keys' => array_keys(request()->all()),
                'files_keys' => array_keys(request()->files->all()),
            ]);

            $data = request()->validate([
                'title' => 'sometimes|string',
                'vendor' => 'sometimes|string',
                'price' => 'sometimes|numeric',
            ]);

            // First, update product title and vendor
            if (isset($data['title']) || isset($data['vendor'])) {
                $input = ['id' => $productId];

                if (isset($data['title'])) {
                    $input['title'] = $data['title'];
                }
                if (isset($data['vendor'])) {
                    $input['vendor'] = $data['vendor'];
                }

                $mutation = <<<'MUTATION'
                mutation updateProduct($input: ProductInput!) {
                    productUpdate(input: $input) {
                        product {
                            id
                            title
                            vendor
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }
                MUTATION;

                $variables = ['input' => $input];

                Log::info('Sending productUpdate mutation', [
                    'product_id' => $productId,
                    'input' => $input,
                    'shop_id' => $shop->id,
                ]);

                $response = $shop->api()->graph($mutation, $variables);

                if (isset($response['body']['errors']) && !empty($response['body']['errors'])) {
                    $errors = json_encode($response['body']['errors']);
                    Log::error('GraphQL errors in productUpdate', ['errors' => $errors]);
                    return response()->json(['error' => 'Shopify API Error: ' . $errors], 500);
                }

                $userErrors = $response['body']['data']['productUpdate']['userErrors'] ?? [];
                if (is_array($userErrors) && count($userErrors) > 0) {
                    $errorMsg = json_encode($userErrors);
                    Log::error('User errors in productUpdate', ['errors' => $errorMsg]);
                    return response()->json(['error' => 'Shopify API Error: ' . $errorMsg], 500);
                }
            }

            // If price is being updated, fetch the first variant and update it via REST API
            if (isset($data['price'])) {
                $getVariantQuery = <<<'QUERY'
                query getProductVariants($id: ID!) {
                    product(id: $id) {
                        variants(first: 1) {
                            edges {
                                node {
                                    id
                                }
                            }
                        }
                    }
                }
                QUERY;

                $variantResponse = $shop->api()->graph($getVariantQuery, ['id' => $productId]);

                if (isset($variantResponse['body']['data']['product']['variants']['edges'][0])) {
                    $variantIdGid = $variantResponse['body']['data']['product']['variants']['edges'][0]['node']['id'];
                    // Extract numeric ID from GID format: "gid://shopify/ProductVariant/123456" -> "123456"
                    $variantId = explode('/', $variantIdGid)[4] ?? $variantIdGid;

                    Log::info('Updating variant price via REST API', [
                        'variant_id' => $variantId,
                        'price' => $data['price'],
                        'shop_id' => $shop->id,
                    ]);

                    try {
                        $response = $shop->api()->rest('PUT', '/admin/api/2024-01/variants/' . $variantId . '.json', [
                            'variant' => [
                                'price' => (string)$data['price'],
                            ]
                        ]);

                        Log::info('Variant price updated successfully', ['response' => $response]);
                    } catch (\Exception $e) {
                        Log::error('Error updating variant price', [
                            'error' => $e->getMessage(),
                            'variant_id' => $variantId,
                        ]);
                        return response()->json(['error' => 'Failed to update price: ' . $e->getMessage()], 500);
                    }
                }
            }

            // If image file is being uploaded, replace the existing image
            Log::info('Checking for image file', ['has_file' => request()->hasFile('imageFile')]);

            if (request()->hasFile('imageFile')) {
                Log::info('Replacing product image via REST API', [
                    'product_id' => $productId,
                    'shop_id' => $shop->id,
                ]);

                try {
                    $file = request()->file('imageFile');
                    $fileContent = file_get_contents($file->getPathname());
                    $base64Image = base64_encode($fileContent);
                    $numericProductId = explode('/', $productId)[4] ?? $productId;

                    // Get all existing images so we can delete them after upload
                    $existingImages = $shop->api()->rest('GET', '/admin/api/2024-01/products/' . $numericProductId . '/images.json');
                    $oldImageIds = [];
                    if (isset($existingImages['body']['images'])) {
                        foreach ($existingImages['body']['images'] as $img) {
                            $oldImageIds[] = $img['id'];
                        }
                    }

                    // Upload the new image
                    $response = $shop->api()->rest('POST', '/admin/api/2024-01/products/' . $numericProductId . '/images.json', [
                        'image' => [
                            'attachment' => $base64Image,
                            'position' => 1,
                        ]
                    ]);

                    Log::info('Product image uploaded successfully', ['response' => $response]);

                    // Delete all old images
                    foreach ($oldImageIds as $oldImageId) {
                        $shop->api()->rest('DELETE', '/admin/api/2024-01/products/' . $numericProductId . '/images/' . $oldImageId . '.json');
                        Log::info('Deleted old image', ['image_id' => $oldImageId]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error replacing product image', [
                        'error' => $e->getMessage(),
                        'product_id' => $productId,
                    ]);
                    return response()->json(['error' => 'Failed to update image: ' . $e->getMessage()], 500);
                }
            }

            Log::info('Product updated successfully', ['product_id' => $productId, 'shop_id' => $shop->id]);

            return response()->json(['success' => true, 'message' => 'Product updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating product', [
                'product_id' => $productId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }
}
