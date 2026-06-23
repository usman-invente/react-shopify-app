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
            \Log::info('Starting product fetch for shop ' . $this->shop->name);

            $api = $this->shop->api();
            \Log::info('Got API client: ' . get_class($api));

            $response = $api->graph(self::GRAPHQL_QUERY);
            \Log::info('Got response, type: ' . gettype($response));
            \Log::info('Response: ' . json_encode($response));

            if (isset($response['body']['errors'])) {
                $errors = json_encode($response['body']['errors']);
                throw new ShopifyApiException('Shopify API Error: ' . $errors);
            }

            if (!isset($response['body']['data']['products']['edges'])) {
                \Log::info('No products found in response');
                return collect([]);
            }

            $edges = $response['body']['data']['products']['edges'];
            \Log::info('Found ' . count($edges) . ' products');

            return $this->transformProducts($response);
        } catch (ShopifyApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('ERROR in getProducts: ' . $e->getMessage());
            throw new ShopifyApiException($e->getMessage(), 0, $e);
        }
    }

    private function transformProducts(array $response): Collection
    {
        $edges = $response['body']['data']['products']['edges'] ?? [];

        return collect($edges)
            ->map(function ($edge) {
                $edge = $this->toArray($edge);
                $node = $this->toArray($edge['node'] ?? []);
                return $this->mapProductNode($node);
            })
            ->filter();
    }

    private function mapProductNode($node): array
    {
        $node = $this->toArray($node);

        return [
            'id' => $node['id'] ?? null,
            'title' => $node['title'] ?? null,
            'status' => strtolower($node['status'] ?? ''),
            'handle' => $node['handle'] ?? null,
            'vendor' => $node['vendor'] ?? null,
            'inventory' => $node['totalInventory'] ?? 0,
            'price' => $this->extractPrice($node),
            'image' => $this->extractImage($node),
        ];
    }

    private function extractPrice($node): ?string
    {
        $node = $this->toArray($node);
        $variants = $node['variants']['edges'] ?? [];

        if (empty($variants)) {
            return null;
        }

        $firstVariant = $this->toArray($variants[0]);
        $variantNode = $this->toArray($firstVariant['node'] ?? []);
        return $variantNode['price'] ?? null;
    }

    private function extractImage($node): ?array
    {
        $node = $this->toArray($node);
        $images = $node['images']['edges'] ?? [];

        if (empty($images)) {
            return null;
        }

        $firstImage = $this->toArray($images[0]);
        $image = $this->toArray($firstImage['node'] ?? []);

        return [
            'src' => $image['src'] ?? null,
            'alt' => $image['altText'] ?? 'Product Image',
        ];
    }

    private function toArray($data): array
    {
        if (is_array($data)) {
            return $data;
        }

        if (is_object($data)) {
            return json_decode(json_encode($data), true);
        }

        return [];
    }
}
