<?php

namespace App\Providers;

use App\Models\Permission;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;

class RbacServiceProvider extends ServiceProvider
{
    public function boot(Router $router): void
    {
        $this->registerGates();
        $this->registerMiddleware($router);
    }

    protected function registerGates(): void
    {
        // Super-admin bypass
        Gate::before(function ($user, $ability) {
            if ($user->hasRole(config('rbac.super_admin_role') ?? 'super-admin')) {
                return true;
            }
        });

        // Define each permission as a Gate
        foreach ($this->getPermissions() as $permission) {
            Gate::define($permission->name, function ($user) use ($permission) {
                $cacheConfig = config('rbac.cache', ['enabled' => false]);

                if ($cacheConfig['enabled'] ?? false) {
                    $key = ($cacheConfig['key'] ?? 'rbac_permissions_') . $user->id;
                    $ttl = $cacheConfig['ttl'] ?? 60;

                    return cache()->remember($key, now()->addMinutes($ttl), function () use ($user, $permission) {
                        return $user->hasPermissionTo($permission->name);
                    });
                }

                return $user->hasPermissionTo($permission->name);
            });
        }
    }

    protected function getPermissions(): \Illuminate\Database\Eloquent\Collection
    {
        return Permission::all();
    }

    /**
     * Register role/permission middleware aliases.
     */
    protected function registerMiddleware(Router $router): void
    {
        $router->aliasMiddleware('role', \App\Http\Middleware\CheckRole::class);
        $router->aliasMiddleware('permission', \App\Http\Middleware\CheckPermission::class);
    }

    public function register(): void
    {
        // Optional: publish config
        $this->publishes([
            __DIR__.'/../config/rbac.php' => config_path('rbac.php'),
        ], 'rbac-config');
    }
}
