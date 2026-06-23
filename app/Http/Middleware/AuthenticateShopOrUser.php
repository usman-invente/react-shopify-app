<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticateShopOrUser
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() || Auth::guard('shopify')->check()) {
            return $next($request);
        }

        return redirect('login');
    }
}
