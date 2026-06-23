# Architecture & Code Standards

This document outlines the architecture and best practices followed in this Laravel application.

## Project Structure

```
app/
├── Exceptions/
│   └── ShopifyApiException.php          # Custom exception for Shopify API errors
├── Http/
│   ├── Controllers/
│   │   ├── ProductController.php        # Product API endpoint controller
│   │   ├── ProfileController.php        # User profile management
│   │   └── Auth/                        # Authentication controllers
│   ├── Middleware/
│   │   └── HandleInertiaRequests.php   # Inertia middleware
│   └── Requests/                        # Form request validation
├── Models/
│   └── User.php                         # User model
├── Services/
│   └── ShopifyProductService.php        # Business logic for Shopify integration
└── Providers/
    └── AppServiceProvider.php            # Service provider configuration
```

## Design Patterns & Best Practices

### 1. Service Layer Pattern

**Location:** `app/Services/ShopifyProductService.php`

Business logic is extracted into a dedicated service class, keeping controllers thin and testable.

**Benefits:**
- Separation of concerns
- Reusable business logic
- Easier testing
- Better code organization

**Example:**
```php
$service = new ShopifyProductService($shop);
$products = $service->getProducts();
```

### 2. Custom Exceptions

**Location:** `app/Exceptions/ShopifyApiException.php`

Application-specific exceptions are used for better error handling and debugging.

**Usage:**
```php
throw new ShopifyApiException('Failed to fetch products');
```

### 3. Logging & Monitoring

All critical operations are logged for debugging and monitoring:
- User authentication (login/logout)
- Profile updates
- API errors
- Unexpected exceptions

**Example:**
```php
Log::info('User profile updated', [
    'user_id' => $user->id,
    'email_changed' => $needsEmailVerification,
]);
```

### 4. Data Transformation

API responses are transformed using helper methods for clarity:
```php
private function mapProductNode(array $node): array
{
    return [
        'id' => $node['id'],
        'title' => $node['title'],
        // ... mapped fields
    ];
}
```

### 5. Null Safety & Type Hinting

All methods use strict type hints and null coalescing operators:
```php
private function extractPrice(array $node): ?string
{
    $variants = $node['variants']['edges'] ?? [];
    // ... safe extraction
}
```

### 6. Transaction Management

Database operations use transactions for data consistency:
```php
DB::transaction(function () use ($user) {
    Auth::logout();
    $user->delete();
});
```

## Code Quality Standards

### Controllers

- ✅ Thin controllers (< 50 lines)
- ✅ Delegate business logic to services
- ✅ Handle HTTP layer only (requests, responses, redirects)
- ✅ Comprehensive error handling with logging

### Services

- ✅ Single responsibility principle
- ✅ Clear method names
- ✅ Type hints on all parameters and returns
- ✅ Private helper methods for data transformation
- ✅ Proper exception handling

### Error Handling

1. **Expected Errors:** Caught and logged gracefully
2. **API Errors:** Converted to meaningful response messages
3. **Unexpected Errors:** Logged with full stack trace

### Validation

All user input is validated using Form Requests:
- `ProfileUpdateRequest` - Profile updates
- `LoginRequest` - Login credentials

## API Integration (Shopify)

### GraphQL Queries

All Shopify API calls use GraphQL for efficiency:
- Faster than REST (single request vs. multiple)
- Returns exactly what's needed
- Built-in error handling

### Service Usage

```php
$service = new ShopifyProductService($shop);
$products = $service->getProducts(); // Returns Collection
```

## Performance Considerations

1. **GraphQL Efficiency:** GraphQL queries fetch only required fields
2. **Caching Ready:** Service layer can be extended with caching
3. **Pagination:** Query limits (first: 50) prevent memory issues
4. **Lazy Loading:** Collections use map/filter for efficiency

## Testing Recommendations

Create tests for:
1. Service layer methods
2. Controller responses
3. Exception handling
4. Data transformation

Example test structure:
```php
// tests/Feature/ProductControllerTest.php
class ProductControllerTest extends TestCase
{
    public function test_can_fetch_products()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/api/products');
        
        $response->assertStatus(200)
                 ->assertJsonStructure(['products']);
    }
}
```

## Future Improvements

1. **Caching:** Add Redis caching for product queries
2. **Webhooks:** Implement Shopify webhooks for real-time updates
3. **Rate Limiting:** Add rate limiting to API endpoints
4. **API Documentation:** Generate OpenAPI/Swagger documentation
5. **Monitoring:** Integrate error tracking (Sentry, etc.)

## Standards Compliance

- **PSR-12:** PHP code style
- **Laravel Conventions:** Directory structure and naming
- **Security:** CSRF protection, SQL injection prevention, authentication/authorization
- **Performance:** Query optimization, efficient API calls
