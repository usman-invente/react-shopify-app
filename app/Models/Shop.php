<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Osiset\ShopifyApp\Contracts\ShopModel as IShopModel;
use Osiset\ShopifyApp\Traits\ShopModel;

class Shop extends Authenticatable implements IShopModel
{
    use HasFactory, Notifiable, ShopModel;

    protected $table = 'shops';

    /**
     * Package stores the shop domain in `name` and the offline access token in `password`.
     */
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'password',
        'shopify_grandfathered',
        'shopify_namespace',
        'shopify_freemium',
        'plan_id',
        'theme_support_level',
        'shopify_offline_refresh_token',
        'shopify_offline_access_token_expires_at',
        'shopify_offline_refresh_token_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'shopify_offline_refresh_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'shopify_grandfathered' => 'boolean',
            'shopify_freemium' => 'boolean',
            'password_updated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
