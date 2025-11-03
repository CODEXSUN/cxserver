<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\Contact;
use App\Models\ContactType;
use App\Models\User;
use App\Policies\BlogPolicy;
use App\Policies\ContactPolicy;
use App\Policies\ContactTypePolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{

    protected array $policies = [
        User::class => UserPolicy::class,
        Blog::class => BlogPolicy::class,
        Contact::class => ContactPolicy::class,
        ContactType::class => ContactTypePolicy::class,
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
