# Shopify Authentication Flow

## Where Is The Authenticate Code?

The authentication code is **provided by the Laravel Shopify package** and is located at:

```
vendor/kyon147/laravel-shopify/src/Http/Controllers/AuthController.php
vendor/kyon147/laravel-shopify/src/Traits/AuthController.php
vendor/kyon147/laravel-shopify/src/resources/routes/shopify.php
```

## Authentication Routes

### Route Definition
**File:** `vendor/kyon147/laravel-shopify/src/resources/routes/shopify.php` (line 59-66)

```php
Route::match(
    ['GET', 'POST'],
    '/authenticate',
    AuthController::class.'@authenticate'
)
->name(Util::getShopifyConfig('route_names.authenticate'));
```

### Token Route
**File:** `vendor/kyon147/laravel-shopify/src/resources/routes/shopify.php` (line 79+)

```php
Route::get(
    '/authenticate/token',
    AuthController::class.'@token'
)
->name(Util::getShopifyConfig('route_names.authenticate.token'));
```

## Authentication Controller

**File:** `vendor/kyon147/laravel-shopify/src/Http/Controllers/AuthController.php`

```php
<?php

namespace Osiset\ShopifyApp\Http\Controllers;

use Illuminate\Routing\Controller;
use Osiset\ShopifyApp\Traits\AuthController as AuthControllerTrait;

/**
 * Responsible for authenticating the shop.
 */
class AuthController extends Controller
{
    use AuthControllerTrait;
}
```

## Authentication Trait (Main Logic)

**File:** `vendor/kyon147/laravel-shopify/src/Traits/AuthController.php`

### authenticate() Method (Lines 30-84)

```php
public function authenticate(Request $request, AuthenticateShop $authShop)
{
    // 1. Check if shop parameter or authenticated user exists
    if ($request->missing('shop') && !$request->user()) {
        throw new MissingShopDomainException('No authenticated user or shop domain');
    }

    // 2. Get the shop domain
    $shopDomain = $request->has('shop')
        ? ShopDomain::fromNative($request->get('shop'))
        : $request->user()->getDomain();

    // 3. Run the authentication action
    [$result, $status] = $authShop($request);

    // 4. Handle authentication response
    if ($status === null) {
        // HMAC verification failed
        throw new SignatureVerificationException('Invalid HMAC verification');
    } elseif ($status === false) {
        // Show fullpage redirect to Shopify OAuth
        return View::make('shopify-app::auth.fullpage_redirect', [
            'apiKey' => Util::getShopifyConfig('api_key', $shopOrigin),
            'url' => $result['url'],
            'host' => $request->get('host'),
            'shopDomain' => $shopDomain,
            'locale' => $request->get('locale'),
        ]);
    } else {
        // Authentication successful, redirect to home
        return Redirect::route(
            Util::getShopifyConfig('route_names.home'),
            [
                'shop' => $shopDomain->toNative(),
                'host' => $request->get('host'),
                'locale' => $request->get('locale'),
            ]
        );
    }
}
```

### token() Method (Lines 91-124)

```php
public function token(Request $request)
{
    // Get session token for shop
    $shopDomain = ShopDomain::fromRequest($request);
    $target = $request->query('target');
    
    // Return token view with shop domain and clean target
    return View::make('shopify-app::auth.token', [
        'shopDomain' => $shopDomain->toNative(),
        'target' => $cleanTarget,
    ]);
}
```

## Authentication Flow Diagram

```
User Visits App
    ↓
GET /authenticate?shop=mystore.myshopify.com
    ↓
AuthController::authenticate()
    ↓
    ├─ Is shop domain provided? NO → Show MissingShopDomainException
    │
    └─ YES → Verify HMAC signature
        ↓
        ├─ Invalid HMAC? → Show SignatureVerificationException
        │
        └─ Valid → Redirect to Shopify OAuth
            ↓
            User authorizes app on Shopify
            ↓
            Shopify redirects back to /authenticate?code=...&shop=...
            ↓
            AuthController::authenticate()
            ↓
            Exchange code for access token
            ↓
            Store token in database (users table)
            ↓
            Emit ShopAuthenticatedEvent
            ↓
            Redirect to home route
            ↓
            User can now access the app!
```

## Configuration

**File:** `config/shopify-app.php`

Key configurations for authentication:

```php
// Route names
'route_names' => [
    'home' => env('SHOPIFY_ROUTE_NAME_HOME', 'home'),
    'authenticate' => env('SHOPIFY_ROUTE_NAME_AUTHENTICATE', 'authenticate'),
    'authenticate.token' => env('SHOPIFY_ROUTE_NAME_AUTHENTICATE_TOKEN', 'authenticate.token'),
],

// API configuration
'api_key' => env('SHOPIFY_API_KEY', ''),
'api_secret' => env('SHOPIFY_API_SECRET', ''),
'api_scopes' => env('SHOPIFY_API_SCOPES', 'read_products,write_products'),

// Grant mode (OFFLINE = permanent token)
'api_grant_mode' => env('SHOPIFY_API_GRANT_MODE', 'OFFLINE'),
```

## Environment Variables Needed

```env
# In your .env file
SHOPIFY_API_KEY="your_api_key_from_partner_dashboard"
SHOPIFY_API_SECRET="your_api_secret_from_partner_dashboard"
SHOPIFY_API_SCOPES="write_products,read_products,write_orders,read_orders"
SHOPIFY_API_VERSION="2024-04"
```

## Authentication Events

When a shop authenticates, the following event is fired:

```php
event(new ShopAuthenticatedEvent($result['shop_id']));
```

You can listen to this in `config/shopify-app.php`:

```php
'listen' => [
    \Osiset\ShopifyApp\Messaging\Events\ShopAuthenticatedEvent::class => [
        \App\Listeners\YourCustomListener::class,
    ],
],
```

## Key Files Used

1. **AuthController.php** - HTTP controller handling requests
2. **AuthController.php (trait)** - Main authentication logic
3. **shopify.php (routes)** - Route definitions
4. **AuthenticateShop.php** - Business logic action for authentication
5. **User Model** - Stores shop data and tokens

## How to Test

1. Make sure your `.env` has valid Shopify credentials
2. Visit: `http://localhost/authenticate?shop=your-store.myshopify.com`
3. You'll be redirected to Shopify to authorize
4. After authorizing, you'll be redirected back and authenticated

## Important Notes

✅ The package handles **all the OAuth complexity**
✅ Access tokens are **automatically refreshed**
✅ Session tokens are managed by JavaScript (auto-refreshed)
✅ HMAC verification prevents **unauthorized requests**
✅ Authentication state is stored in the **users table**

You **don't need to modify** the authentication code - it's production-ready!
