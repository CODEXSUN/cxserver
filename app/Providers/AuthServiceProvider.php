<?php

namespace App\Providers;

use App\Models\Contact;
use App\Models\Enquiry;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskCategory;
use App\Models\SlaTicket;
use App\Models\Quotation;
use App\Models\Invoice;
use App\Models\ContactFeedback;
use App\Models\Activity;
use App\Models\OtpToken;
use App\Policies\ContactPolicy;
use App\Policies\EnquiryPolicy;
use App\Policies\JobPolicy;
use App\Policies\JobCategoryPolicy;
use App\Policies\TaskPolicy;
use App\Policies\TaskAssignmentPolicy;
use App\Policies\TaskCategoryPolicy;
use App\Policies\SlaTicketPolicy;
use App\Policies\QuotationPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\ContactFeedbackPolicy;
use App\Policies\ActivityPolicy;
use App\Policies\OtpTokenPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Core Entities
        Contact::class => ContactPolicy::class,
        Enquiry::class => EnquiryPolicy::class,
        Job::class => JobPolicy::class,
        JobCategory::class => JobCategoryPolicy::class,
        Task::class => TaskPolicy::class,
        TaskCategory::class => TaskCategoryPolicy::class,
        TaskAssignment::class => TaskAssignmentPolicy::class,

        // Support & Billing
        SlaTicket::class => SlaTicketPolicy::class,
        Quotation::class => QuotationPolicy::class,
        Invoice::class => InvoicePolicy::class,
        ContactFeedback::class => ContactFeedbackPolicy::class,

        // Audit & Security
        Activity::class => ActivityPolicy::class,
        OtpToken::class => OtpTokenPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // ===================================================================
        // GLOBAL GATES (Role-based Permissions)
        // ===================================================================
        // Use: $user->can('manage contacts') in policies or controllers
        // Extend with Spatie Permissions or custom roles table later

        // Super Admin (bypass all)
        Gate::before(function ($user, $ability) {
            if ($user->is_admin ?? false) {
                return true;
            }
        });

        // -------------------------------------------------------------------
        // Contact Management
        // -------------------------------------------------------------------
        Gate::define('manage contacts', fn($user) => in_array($user->role, ['admin', 'manager', 'sales']));
        Gate::define('view contacts', fn($user) => in_array($user->role, ['admin', 'manager', 'sales', 'support']));

        // -------------------------------------------------------------------
        // Enquiry Management
        // -------------------------------------------------------------------
        Gate::define('manage enquiries', fn($user) => in_array($user->role, ['admin', 'manager', 'sales']));
        Gate::define('resolve enquiry', fn($user) => in_array($user->role, ['admin', 'manager', 'sales']));

        // -------------------------------------------------------------------
        // Job & Task Management
        // -------------------------------------------------------------------
        Gate::define('manage jobs', fn($user) => in_array($user->role, ['admin', 'manager', 'sales', 'project_lead']));
        Gate::define('manage tasks', fn($user) => in_array($user->role, ['admin', 'manager', 'project_lead']));
        Gate::define('assign tasks', fn($user) => in_array($user->role, ['admin', 'manager', 'project_lead']));
        Gate::define('complete own task', fn($user) => true); // Any assigned user

        // -------------------------------------------------------------------
        // Billing & Quotes
        // -------------------------------------------------------------------
        Gate::define('manage quotations', fn($user) => in_array($user->role, ['admin', 'manager', 'sales', 'finance']));
        Gate::define('manage invoices', fn($user) => in_array($user->role, ['admin', 'finance']));
        Gate::define('view billing', fn($user) => in_array($user->role, ['admin', 'manager', 'sales', 'finance']));

        // -------------------------------------------------------------------
        // SLA & Performance
        // -------------------------------------------------------------------
        Gate::define('view sla', fn($user) => in_array($user->role, ['admin', 'manager', 'project_lead']));
        Gate::define('view analytics', fn($user) => in_array($user->role, ['admin', 'manager']));

        // -------------------------------------------------------------------
        // Feedback & Audit
        // -------------------------------------------------------------------
        Gate::define('view feedback', fn($user) => in_array($user->role, ['admin', 'manager', 'sales']));
        Gate::define('view activities', fn($user) => in_array($user->role, ['admin', 'manager']));

        // -------------------------------------------------------------------
        // OTP & Secure Actions
        // -------------------------------------------------------------------
        Gate::define('use otp', fn($user) => true); // Any logged-in user
        Gate::define('bypass otp', fn($user) => $user->role === 'admin');

        // -------------------------------------------------------------------
        // Categories
        // -------------------------------------------------------------------
        Gate::define('manage categories', fn($user) => in_array($user->role, ['admin', 'manager']));

        // ===================================================================
        // CUSTOM ABILITY: Convert Enquiry → Job
        // ===================================================================
        Gate::define('convert enquiry to job', function ($user, $enquiry) {
            return $enquiry->status === 'resolved'
                && Gate::allows('manage jobs')
                && !$enquiry->job()->exists();
        });

        // ===================================================================
        // CUSTOM ABILITY: Submit Task (only assigned user)
        // ===================================================================
        Gate::define('submit task', function ($user, $assignment) {
            return $assignment->user_id === $user->id
                && in_array($assignment->status, ['in_progress', 'accepted']);
        });

        // ===================================================================
        // CUSTOM ABILITY: Handoff Task
        // ===================================================================
        Gate::define('handoff task', function ($user, $assignment) {
            return $assignment->user_id === $user->id
                && $assignment->status === 'in_progress';
        });
    }
}
