<?php


namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user || !collect($permissions)->first(fn($perm) => $user->hasPermissionTo($perm))) {
            abort(403, 'Unauthorized: Insufficient permission.');
        }

        return $next($request);
    }
}
