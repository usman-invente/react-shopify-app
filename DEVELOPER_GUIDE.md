# Developer Guide

Quick reference guide for developers working on this project.

## Project Setup

### Installation
```bash
# Install dependencies
composer install
npm install

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate
```

### Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Configure Shopify credentials
SHOPIFY_API_KEY="your_key"
SHOPIFY_API_SECRET="your_secret"
```

### Running the Project
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

## Common Tasks

### Adding a New Endpoint

1. **Create the Service** (`app/Services/`)
   ```php
   class MyNewService {
       public function __construct(private User $shop) {}
       
       public function getData(): Collection {
           // Implementation
       }
   }
   ```

2. **Create the Controller** (`app/Http/Controllers/`)
   ```php
   public function index(): JsonResponse {
       try {
           $service = new MyNewService($shop);
           $data = $service->getData();
           return response()->json(['data' => $data->toArray()]);
       } catch (ShopifyApiException $e) {
           Log::error('Error', ['message' => $e->getMessage()]);
           return response()->json(['error' => 'Failed'], 500);
       }
   }
   ```

3. **Add the Route** (`routes/web.php`)
   ```php
   Route::get('/api/my-data', [MyDataController::class, 'index']);
   ```

4. **Test it**
   ```bash
   curl http://localhost/api/my-data
   ```

### Adding a New Feature

1. **Create Model** (if needed)
   ```bash
   php artisan make:model MyModel -m
   ```

2. **Create Service**
   ```bash
   # Create in app/Services/
   ```

3. **Create Controller**
   ```bash
   php artisan make:controller MyFeatureController
   ```

4. **Add Tests**
   ```bash
   php artisan make:test MyFeatureTest --feature
   ```

5. **Document it**
   - Add to API_DOCUMENTATION.md
   - Add code comments
   - Update CHANGELOG

### Debugging

#### View Logs
```bash
# Real-time logs
tail -f storage/logs/laravel.log

# Last 50 lines
tail -50 storage/logs/laravel.log
```

#### Database Debugging
```bash
# Check SQLite database
sqlite3 database/database.sqlite

# List tables
.tables

# Query data
SELECT * FROM users;
```

#### Laravel Tinker
```bash
php artisan tinker

# Try commands
>>> $user = User::first();
>>> $service = new App\Services\ShopifyProductService($user);
>>> $service->getProducts();
```

## Code Patterns

### Service Method Template
```php
/**
 * Do something important
 *
 * @throws ShopifyApiException
 * @return Collection
 */
public function doSomething(): Collection
{
    try {
        // Implementation
        return collect([]);
    } catch (\Exception $e) {
        Log::error('Error in doSomething', [
            'error' => $e->getMessage(),
            'shop_id' => $this->shop->id,
        ]);
        
        throw new ShopifyApiException('Failed to do something');
    }
}
```

### Controller Method Template
```php
/**
 * Handle HTTP request
 */
public function index(Request $request): JsonResponse
{
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $service = new MyService($user);
        $result = $service->getData();

        return response()->json(['data' => $result]);
    } catch (ShopifyApiException $e) {
        Log::error('Shopify error', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'Shopify API error'], 500);
    } catch (\Exception $e) {
        Log::error('Unexpected error', ['trace' => $e->getTraceAsString()]);
        return response()->json(['error' => 'An error occurred'], 500);
    }
}
```

## Testing

### Run Tests
```bash
# All tests
php artisan test

# Single test class
php artisan test tests/Feature/ProductControllerTest.php

# Specific test method
php artisan test tests/Feature/ProductControllerTest.php --filter test_name

# With code coverage
php artisan test --coverage
```

### Test Template
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class MyControllerTest extends TestCase
{
    public function test_authenticated_user_can_access_endpoint()
    {
        $user = User::factory()->create();
        
        $response = $this
            ->actingAs($user)
            ->get('/api/endpoint');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data']);
    }

    public function test_unauthenticated_user_cannot_access_endpoint()
    {
        $response = $this->get('/api/endpoint');

        $response->assertStatus(401);
    }
}
```

## Git Workflow

### Branch Naming
```
feature/description
fix/description
refactor/description
docs/description
test/description
```

### Commit Messages
```
[Feature] Add product search endpoint

- Implement GraphQL query for product search
- Add validation for search terms
- Add tests for endpoint
- Add documentation

Fixes #123
```

### Before Pushing
```bash
# Run tests
php artisan test

# Check code style
./vendor/bin/phpstan analyse app/

# View changes
git diff

# Commit
git commit -m "[Feature] Description"

# Push
git push origin feature/name
```

## Performance Tips

### Database
```php
// ❌ Bad: N+1 query
foreach ($products as $product) {
    echo $product->category->name;
}

// ✅ Good: Eager load
$products = Product::with('category')->get();
```

### API Calls
```php
// ❌ Bad: Multiple requests
$product1 = $shop->api()->get('/admin/api/products/1');
$product2 = $shop->api()->get('/admin/api/products/2');

// ✅ Good: Single GraphQL query
$products = $service->getProductsByIds(['1', '2']);
```

### Caching
```php
// Cache expensive queries
$products = Cache::remember('shopify_products', 3600, function () {
    $service = new ShopifyProductService($shop);
    return $service->getProducts();
});
```

## Troubleshooting

### "Class not found" Error
```bash
# Regenerate autoloader
composer dump-autoload
```

### Permission Denied
```bash
# Fix storage permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Database Issues
```bash
# Fresh migration
php artisan migrate:fresh

# Seed database
php artisan db:seed
```

### Cache Issues
```bash
# Clear all caches
php artisan cache:clear

# Clear config cache
php artisan config:clear

# Clear view cache
php artisan view:clear
```

## Useful Commands

```bash
# List routes
php artisan route:list

# Show app config
php artisan tinker

# Generate optimization files
php artisan optimize

# Make a request
php artisan tinker
>>> Http::get('http://localhost/api/products')

# Watch logs
php artisan logs

# Generate API documentation
php artisan telescope:publish
```

## Code Quality Tools

### Static Analysis
```bash
composer require phpstan/phpstan --dev
./vendor/bin/phpstan analyse app/
```

### Code Style
```bash
composer require laravel/pint --dev
./vendor/bin/pint
```

### Testing Coverage
```bash
php artisan test --coverage
```

## Deployment

### Pre-Deployment Checklist
- [ ] Tests pass: `php artisan test`
- [ ] Code style OK: `./vendor/bin/pint --check`
- [ ] No console errors: `npm run build`
- [ ] Migrations ready: `php artisan migrate --dry-run`
- [ ] Environment configured: `.env` set correctly
- [ ] Dependencies updated: `composer update`
- [ ] Log files cleared: `rm storage/logs/*.log`

### Deployment Steps
```bash
# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Build frontend
npm run build

# Run migrations
php artisan migrate --force

# Clear caches
php artisan optimize

# Restart queue (if applicable)
php artisan queue:restart
```

## Resources

- [Laravel Docs](https://laravel.com/docs)
- [Shopify API Docs](https://shopify.dev/api)
- [GraphQL Guide](https://shopify.dev/api/admin-graphql)
- [PHP Standards](https://www.php-fig.org/psr/psr-12/)

## Support

For questions or issues:
1. Check the documentation files
2. Search the logs for errors
3. Review the tests for examples
4. Check the git history for context
