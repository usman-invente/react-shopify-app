<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RememberConnectingUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('authenticate') && $request->has('shop') && Auth::guard('web')->check()) {
            $request->session()->put('shop_connect_user_id', Auth::guard('web')->id());
        }

        return $next($request);
    }
}
