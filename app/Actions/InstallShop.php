<?php

namespace App\Actions;

use App\Models\Shop as ShopModel;
use Exception;
use Gnikyt\BasicShopifyAPI\Session;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Actions\InstallShop as BaseInstallShop;
use Osiset\ShopifyApp\Actions\VerifyThemeSupport;
use Osiset\ShopifyApp\Contracts\ApiHelper as IApiHelper;
use Osiset\ShopifyApp\Contracts\Commands\Shop as IShopCommand;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;
use Osiset\ShopifyApp\Objects\Enums\AuthMode;
use Osiset\ShopifyApp\Objects\Enums\ThemeSupportLevel as ThemeSupportLevelEnum;
use Osiset\ShopifyApp\Objects\Values\NullAccessToken;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Objects\Values\ThemeSupportLevel;
use Osiset\ShopifyApp\Util;

class InstallShop extends BaseInstallShop
{
    public function __construct(
        IShopQuery $shopQuery,
        IShopCommand $shopCommand,
        IApiHelper $apiHelper,
        VerifyThemeSupport $verifyThemeSupport
    ) {
        parent::__construct($shopQuery, $shopCommand, $apiHelper, $verifyThemeSupport);
    }

    public function __invoke(ShopDomain $shopDomain, ?string $code = null, ?string $idToken = null): array
    {
        $shop = $this->shopQuery->getByDomain($shopDomain, [], true);

        if ($shop === null) {
            $this->shopCommand->make($shopDomain, NullAccessToken::fromNative(null));
            $shop = $this->shopQuery->getByDomain($shopDomain);
        }

        $apiHelper = $this->apiHelper->make(new Session(
            $shop->getDomain()->toNative(),
            $shop->getAccessToken()->toNative()
        ));
        $grantMode = $shop->hasOfflineAccess()
            ? AuthMode::fromNative(Util::getShopifyConfig('api_grant_mode', $shop))
            : AuthMode::OFFLINE();

        if (empty($code) && empty($idToken)) {
            return [
                'completed' => false,
                'url' => $apiHelper->buildAuthUrl($grantMode, Util::getShopifyConfig('api_scopes', $shop)),
                'shop_id' => $shop->getId(),
            ];
        }

        try {
            if ($shop->trashed()) {
                $shop->restore();
            }

            $data = $idToken !== null
                ? $apiHelper->performOfflineTokenExchange($idToken)
                : $apiHelper->getAccessData($code, $grantMode);
            $this->persistShopifyOAuthTokens($shop, $data, $grantMode);

            try {
                $this->linkShopToConnectingUser($shop->getDomain()->toNative());
            } catch (Exception $e) {
                Log::warning('Could not link shop to user after OAuth', [
                    'shop' => $shopDomain->toNative(),
                    'message' => $e->getMessage(),
                ]);
            }

            try {
                $themeSupportLevel = call_user_func($this->verifyThemeSupport, $shop->getId());
                $this->shopCommand->setThemeSupportLevel($shop->getId(), ThemeSupportLevel::fromNative($themeSupportLevel));
            } catch (Exception $e) {
                $themeSupportLevel = ThemeSupportLevelEnum::NONE;
            }

            return [
                'completed' => true,
                'url' => null,
                'shop_id' => $shop->getId(),
                'theme_support_level' => $themeSupportLevel,
            ];
        } catch (Exception $e) {
            Log::error('Shopify OAuth install failed', [
                'shop' => $shopDomain->toNative(),
                'has_code' => ! empty($code),
                'message' => $e->getMessage(),
                'exception' => $e::class,
            ]);

            return [
                'completed' => false,
                'url' => null,
                'shop_id' => null,
                'theme_support_level' => null,
            ];
        }
    }

    private function linkShopToConnectingUser(string $shopDomain): void
    {
        $userId = session('shop_connect_user_id');

        if (!$userId) {
            return;
        }

        ShopModel::where('name', $shopDomain)->update(['user_id' => $userId]);
        session()->forget('shop_connect_user_id');

        Log::info('Linked Shopify shop to user', [
            'shop_domain' => $shopDomain,
            'user_id' => $userId,
        ]);
    }
}
