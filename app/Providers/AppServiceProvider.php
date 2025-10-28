<?php

namespace App\Providers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Log every API request (only in local)
        if (app()->environment('local')) {
            \Illuminate\Support\Facades\Event::listen(
                \Illuminate\Foundation\Http\Events\RequestHandled::class,
                function ($event) {
                    Log::channel('api')->info('API', [
                        'url' => $event->request->fullUrl(),
                        'method' => $event->request->method(),
                        'input' => $event->request->except(['password']),
                        'response' => $event->response->getContent(),
                        'status' => $event->response->getStatusCode(),
                    ]);
                }
            );
        }
    }
}
