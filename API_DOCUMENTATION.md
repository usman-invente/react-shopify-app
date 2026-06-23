# API Documentation

## Endpoints

### GET `/api/products`

Fetch all products from the connected Shopify store.

**Authentication:** Required (Bearer token via session)

**Response:** 200 OK

```json
{
    "products": [
        {
            "id": "gid://shopify/Product/123456",
            "title": "Product Name",
            "status": "active",
            "handle": "product-name",
            "vendor": "Vendor Name",
            "inventory": 42,
            "price": "99.99",
            "image": {
                "src": "https://...",
                "alt": "Product Image"
            }
        }
    ]
}
```

**Error Response:** 500 Internal Server Error

```json
{
    "error": "Failed to fetch products"
}
```

**Error Response:** 401 Unauthenticated

```json
{
    "error": "Unauthenticated"
}
```

### Curl Example

```bash
curl -X GET http://localhost/api/products \
  -H "Accept: application/json" \
  -H "Cookie: LARAVEL_SESSION=..."
```

### JavaScript Example

```javascript
fetch('/api/products', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
})
.then(response => response.json())
.then(data => console.log(data.products))
.catch(error => console.error('Error:', error));
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Shopify product ID (GraphQL ID) |
| `title` | string | Product name |
| `status` | string | Product status: `active` or `draft` |
| `handle` | string | URL-friendly product slug |
| `vendor` | string | Product vendor/supplier name |
| `inventory` | integer | Total inventory count |
| `price` | string | Price of the first variant |
| `image.src` | string | Image URL |
| `image.alt` | string | Image alt text |

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 200 | OK | Successfully fetched products |
| 401 | Unauthenticated | User session expired or invalid |
| 500 | Failed to fetch products | Shopify API error or connection issue |

## Rate Limiting

Shopify API rate limits depend on your plan:
- **Standard plans:** 2 requests/second
- **Plus plans:** 4 requests/second

The laravel-shopify package handles retries automatically.

## Pagination

Currently fetches the first 50 products. To extend:

```php
// In ShopifyProductService.php
const GRAPHQL_QUERY = <<<'QUERY'
{
    products(first: 100, after: "cursor_token") {
        // ...
    }
}
QUERY;
```

## GraphQL Fields Available

You can extend the GraphQL query to include:

```graphql
{
    products(first: 50) {
        edges {
            node {
                id
                title
                status
                description      # Add description
                category         # Add category
                vendor           # Vendor name
                totalInventory   # Total stock
                options {        # Product options/variants
                    name
                    values
                }
                collections {    # Collections this product belongs to
                    edges {
                        node {
                            id
                            title
                        }
                    }
                }
                metafields {     # Custom metadata
                    edges {
                        node {
                            namespace
                            key
                            value
                        }
                    }
                }
            }
        }
    }
}
```

## Implementation Examples

### Fetch All Products (Frontend)

```javascript
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayProducts(data.products);
    } catch (error) {
        console.error('Failed to load products:', error);
        showErrorMessage('Could not load products');
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    
    products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}
```

### Filter Products (Backend)

```php
// In ProductController
$service = new ShopifyProductService($shop);
$allProducts = $service->getProducts();

$filtered = $allProducts
    ->filter(fn($p) => $p['status'] === 'active')
    ->filter(fn($p) => $p['inventory'] > 0)
    ->sortBy('title');
```

## Troubleshooting

### No Products Returned

1. Check Shopify API credentials in `.env`
2. Verify the authenticated user has shop access
3. Check Laravel logs: `storage/logs/laravel.log`

### API Error: "Invalid API Token"

- Shopify credentials are incorrect
- Token has expired
- Insufficient permissions in app scopes

### Slow Response

- Shopify API is rate limited (wait a moment)
- Large product catalog (implement pagination)
- Network latency (use caching)
