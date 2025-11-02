<?php


namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !collect($roles)->first(fn($role) => $user->hasRole($role))) {
            abort(403, 'Unauthorized: Insufficient role.');
        }

        return $next($request);
    }
}
