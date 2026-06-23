# Code Standards & Professional Practices

## Overview

This codebase follows enterprise-level Laravel practices equivalent to a 5+ year experienced developer.

## Key Improvements Made

### 1. Service Layer Architecture

**Before:**
```php
// Logic mixed in controller
public function index() {
    try {
        $response = $shop->api()->graph($query);
        // 50+ lines of transformation logic
    }
}
```

**After:**
```php
// Thin controller
public function index(): JsonResponse {
    $service = new ShopifyProductService($shop);
    $products = $service->getProducts();
    return response()->json(['products' => $products->toArray()]);
}
```

### 2. Exception Handling

Created custom `ShopifyApiException` for:
- Clear error messages
- Proper HTTP status codes
- Consistent error responses
- Easy exception catching and handling

```php
throw new ShopifyApiException('Failed to fetch products');
```

### 3. Comprehensive Logging

All critical operations logged with context:
```php
Log::info('User profile updated', [
    'user_id' => $user->id,
    'email_changed' => $needsEmailVerification,
]);
```

Benefits:
- Debugging production issues
- Monitoring user actions
- Security audit trails
- Performance analysis

### 4. Data Transformation

Private helper methods for clarity and reusability:
```php
private function mapProductNode(array $node): array
private function extractPrice(array $node): ?string
private function extractImage(array $node): ?array
```

### 5. Type Safety

All methods have return type declarations:
```php
public function getProducts(): Collection
private function extractPrice(array $node): ?string
private function hasApiError(array $response): bool
```

### 6. Transaction Management

Database operations wrapped in transactions:
```php
DB::transaction(function () use ($user) {
    Auth::logout();
    $user->delete();
});
```

### 7. Null Safety

Safe property access using null coalescing:
```php
$vendor = $node['vendor'] ?? null;
$images = $node['images']['edges'] ?? [];
```

## Controller Standards

### ✅ Dos

- Single responsibility (one action per method)
- Delegate to services
- Validate input using Form Requests
- Return appropriate status codes
- Log important operations
- Type hint all parameters and returns

### ❌ Don'ts

- Mix business logic with HTTP layer
- Have methods > 30 lines
- Catch all exceptions with `Exception`
- Return inconsistent response formats
- Skip error logging
- Use weak types or no types

## Service Layer Standards

### ✅ Dos

- Extract business logic here
- Use private helper methods
- Type hint everything
- Throw custom exceptions
- Document complex algorithms
- Keep methods focused

### ❌ Don'ts

- Make HTTP calls directly (use controllers)
- Have unclear method names
- Use global state
- Mix multiple concerns
- Skip validation
- Return raw API responses

## Error Handling Pattern

```php
try {
    // Attempt operation
    $result = $this->doSomething();
    return response()->json(['data' => $result]);
} catch (CustomException $e) {
    // Expected errors - log and handle gracefully
    Log::error('Custom error', ['message' => $e->getMessage()]);
    return response()->json(['error' => 'User-friendly message'], 422);
} catch (\Exception $e) {
    // Unexpected errors - log with context
    Log::error('Unexpected error', [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ]);
    return response()->json(['error' => 'An error occurred'], 500);
}
```

## Testing Approach

### Unit Tests (Services)

Test business logic in isolation:
```php
class ShopifyProductServiceTest extends TestCase {
    public function test_transforms_graphql_response_correctly() {
        $service = new ShopifyProductService($shop);
        $products = $service->getProducts();
        
        $this->assertEquals('active', $products[0]['status']);
    }
}
```

### Feature Tests (Controllers)

Test HTTP endpoints:
```php
class ProductControllerTest extends TestCase {
    public function test_authenticated_user_can_fetch_products() {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/api/products');
        
        $response->assertStatus(200)
                 ->assertJsonStructure(['products']);
    }
}
```

## Documentation Standards

### File Headers
```php
/**
 * Handle user authentication and session management
 * 
 * Responsible for:
 * - Login/logout operations
 * - Session regeneration
 * - Audit logging
 */
```

### Method Documentation
```php
/**
 * Fetch products from Shopify
 *
 * @throws ShopifyApiException
 * @return Collection
 */
public function getProducts(): Collection
```

### Inline Comments
Only for "why", not "what":
```php
// ❌ Bad
$email = $data['email']; // Get email

// ✅ Good
// Lowercase email to normalize user input
$email = strtolower($data['email']);
```

## Performance Best Practices

1. **GraphQL over REST:** Fewer API calls, smaller payloads
2. **Collections:** Use `->filter()`, `->map()` for efficiency
3. **Eager Loading:** (Future) Load relationships eagerly
4. **Caching:** (Future) Cache Shopify queries
5. **Pagination:** Limit query results to prevent memory issues

## Security Best Practices

1. ✅ Input validation (Form Requests)
2. ✅ CSRF protection (middleware)
3. ✅ Authentication middleware on routes
4. ✅ SQL injection prevention (Eloquent)
5. ✅ Sensitive data logging masked
6. ✅ Session management (regenerate tokens)

## Code Review Checklist

Before committing, verify:

- [ ] Meaningful method/variable names
- [ ] Type hints on all methods
- [ ] Error handling with logging
- [ ] No sensitive data in logs
- [ ] Business logic in services
- [ ] Controllers < 30 lines
- [ ] Documentation for complex logic
- [ ] Consistent formatting
- [ ] No commented-out code
- [ ] Tests added for new features

## File Organization

```
app/
├── Exceptions/        # Custom exceptions
├── Http/
│   ├── Controllers/   # Thin controllers only
│   ├── Middleware/    # Request/response middleware
│   └── Requests/      # Form validation
├── Models/            # Database models
├── Services/          # Business logic
└── Providers/         # Service providers
```

## Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| Classes | PascalCase | `ShopifyProductService` |
| Methods | camelCase | `getProducts()` |
| Constants | UPPER_SNAKE_CASE | `GRAPHQL_QUERY` |
| Variables | camelCase | `$shopService` |
| Properties | camelCase | `$products` |
| Interfaces | PascalCase + Suffix | `RepositoryInterface` |
| Exceptions | PascalCase + Suffix | `ShopifyApiException` |

## Version Control

### Commit Message Format

```
[Type] Brief description

Longer explanation if needed.
- Point 1
- Point 2

Fixes #123
```

**Types:**
- `[Feature]` - New feature
- `[Fix]` - Bug fix
- `[Refactor]` - Code reorganization
- `[Docs]` - Documentation
- `[Test]` - Tests only
- `[Chore]` - Dependencies, config

## Continuous Improvement

Regular practices:
1. **Code Reviews:** Peer review all PRs
2. **Refactoring:** Improve code constantly
3. **Testing:** Maintain high coverage
4. **Documentation:** Keep docs updated
5. **Monitoring:** Track errors and performance
