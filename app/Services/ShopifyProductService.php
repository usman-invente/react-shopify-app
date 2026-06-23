<?php

namespace App\Services;

use App\Exceptions\ShopifyApiException;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ShopifyProductService
{
    private const GRAPHQL_QUERY = <<<'QUERY'
    {
        products(first: 50) {
            edges {
                node {
                    id
                    title
                    status
                    handle
                    vendor
                    totalInventory
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

    public function __construct(private User $shop)
    {
        if (!$this->shop || !method_exists($this->shop, 'api')) {
            throw new ShopifyApiException('Invalid shop or shop has no API access');
        }
    }

    /**
     * Fetch products from Shopify
     *
     * @throws ShopifyApiException
     * @return Collection
     */
    public function getProducts(): Collection
    {
        try {
            $response = $this->shop->api()->graph(self::GRAPHQL_QUERY);

            if ($this->hasApiError($response)) {
                throw new ShopifyApiException('Failed to fetch products from Shopify API');
            }

            return $this->transformProducts($response);
        } catch (ShopifyApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Shopify API Error', [
                'error' => $e->getMessage(),
                'shop_id' => $this->shop->id,
            ]);

            throw new ShopifyApiException('An error occurred while fetching products', 0, $e);
        }
    }

    /**
     * Check if API response contains errors
     */
    private function hasApiError(array $response): bool
    {
        return !isset($response['body']['data']['products']) ||
               isset($response['body']['errors']);
    }

    /**
     * Transform GraphQL response into collection
     */
    private function transformProducts(array $response): Collection
    {
        $edges = $response['body']['data']['products']['edges'] ?? [];

        return collect($edges)
            ->map(fn (array $edge) => $this->mapProductNode($edge['node']))
            ->filter();
    }

    /**
     * Map a single product node
     */
    private function mapProductNode(array $node): array
    {
        return [
            'id' => $node['id'],
            'title' => $node['title'],
            'status' => strtolower($node['status']),
            'handle' => $node['handle'],
            'vendor' => $node['vendor'] ?? null,
            'inventory' => $node['totalInventory'] ?? 0,
            'price' => $this->extractPrice($node),
            'image' => $this->extractImage($node),
        ];
    }

    /**
     * Extract price from variants
     */
    private function extractPrice(array $node): ?string
    {
        $variants = $node['variants']['edges'] ?? [];

        if (empty($variants)) {
            return null;
        }

        return $variants[0]['node']['price'] ?? null;
    }

    /**
     * Extract image from product
     */
    private function extractImage(array $node): ?array
    {
        $images = $node['images']['edges'] ?? [];

        if (empty($images)) {
            return null;
        }

        $image = $images[0]['node'];

        return [
            'src' => $image['src'] ?? null,
            'alt' => $image['altText'] ?? 'Product Image',
        ];
    }
}
