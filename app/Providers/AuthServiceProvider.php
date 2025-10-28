<?php

namespace App\Providers;

use App\Models\Contact;
use App\Models\Enquiry;
use App\Models\ProjectCategory;
use App\Models\TaskCategory;
use App\Policies\ContactPolicy;
use App\Policies\EnquiryPolicy;
use App\Policies\ProjectCategoryPolicy;
use App\Policies\TaskCategoryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{

    protected $policies = [
        Contact::class => ContactPolicy::class,
        Enquiry::class => EnquiryPolicy::class,
        ProjectCategory::class => ProjectCategoryPolicy::class,
        TaskCategory::class => TaskCategoryPolicy::class,

    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
