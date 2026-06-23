<?php

namespace App\Services;

use App\Exceptions\ShopifyApiException;
use App\Models\Shop;
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

    public function __construct(private Shop $shop)
    {
        if (!$this->shop || !method_exists($this->shop, 'api')) {
            throw new ShopifyApiException('Invalid shop or shop has no API access');
        }
    }

    public function getProducts(): Collection
    {
        try {
            $response = $this->shop->api()->graph(self::GRAPHQL_QUERY);

            if (isset($response['body']['errors'])) {
                $errors = json_encode($response['body']['errors']);
                throw new ShopifyApiException('Shopify API Error: ' . $errors);
            }

            if (!isset($response['body']['data']['products']['edges'])) {
                return collect([]);
            }

            return $this->transformProducts($response);
        } catch (ShopifyApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Shopify product fetch failed', [
                'shop_id' => $this->shop->id,
                'error' => $e->getMessage(),
            ]);
            throw new ShopifyApiException($e->getMessage(), 0, $e);
        }
    }

    private function transformProducts(array $response): Collection
    {
        $edges = $response['body']['data']['products']['edges'] ?? [];

        return collect($edges)
            ->map(fn (array $edge) => $this->mapProductNode($edge['node']))
            ->filter();
    }

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

    private function extractPrice(array $node): ?string
    {
        $variants = $node['variants']['edges'] ?? [];
        return $variants[0]['node']['price'] ?? null;
    }

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
