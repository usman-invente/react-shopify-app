<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Fetch products from Shopify using GraphQL
     */
    public function index(): JsonResponse
    {
        try {
            $shop = Auth::user();

            if (!$shop) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            // GraphQL query to fetch products
            $query = <<<'QUERY'
            {
                products(first: 50) {
                    edges {
                        node {
                            id
                            title
                            status
                            handle
                            variants(first: 1) {
                                edges {
                                    node {
                                        id
                                        price
                                    }
                                }
                            }
                            images(first: 1) {
                                edges {
                                    node {
                                        src
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
            }
            QUERY;

            // Execute GraphQL query
            $response = $shop->api()->graph($query);

            if (!isset($response['body']['data']['products'])) {
                return response()->json(['products' => [], 'error' => 'Could not fetch products'], 200);
            }

            // Transform GraphQL response into simpler format
            $products = [];
            foreach ($response['body']['data']['products']['edges'] as $edge) {
                $node = $edge['node'];
                $product = [
                    'id' => $node['id'],
                    'title' => $node['title'],
                    'status' => strtolower($node['status']),
                    'handle' => $node['handle'],
                ];

                // Get price from first variant
                if (!empty($node['variants']['edges'])) {
                    $product['variants'] = [
                        [
                            'id' => $node['variants']['edges'][0]['node']['id'],
                            'price' => $node['variants']['edges'][0]['node']['price'],
                        ],
                    ];
                } else {
                    $product['variants'] = [];
                }

                // Get image
                if (!empty($node['images']['edges'])) {
                    $product['image'] = [
                        'src' => $node['images']['edges'][0]['node']['src'],
                        'alt' => $node['images']['edges'][0]['node']['altText'],
                    ];
                } else {
                    $product['image'] = null;
                }

                $products[] = $product;
            }

            return response()->json(['products' => $products]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
