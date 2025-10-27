<?php

namespace App\Providers;

use App\Models\Contact;
use App\Models\Enquiry;
use App\Policies\ContactPolicy;
use App\Policies\EnquiryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{

    protected $policies = [
        Contact::class => ContactPolicy::class,
        Enquiry::class => EnquiryPolicy::class,

    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
