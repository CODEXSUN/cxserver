<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{

    protected array $policies = [
        \App\Models\User::class => \App\Policies\UserPolicy::class,
        \App\Models\Blog::class => \App\Policies\BlogPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auto-register policies for all models in app/Models
        collect(File::allFiles(app_path('Models')))
            ->map(fn($file) => 'App\\Models\\' . $file->getFilenameWithoutExtension())
            ->filter(fn($model) => class_exists($model))
            ->each(function ($model) {
                $policy = 'App\\Policies\\' . class_basename($model) . 'Policy';
                if (class_exists($policy)) {
                    Gate::policy($model, $policy);
                }
            });
    }
}
