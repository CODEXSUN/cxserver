<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactSearchController;
use App\Http\Controllers\ContactTypeController;
use App\Http\Controllers\JobAssignmentController;
use App\Http\Controllers\JobCardController;
use App\Http\Controllers\ServiceInwardController;
use App\Http\Controllers\ServiceStatusController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::get('/abouts', function () {
    return Inertia::render('web/About');
})->name('abouts');

Route::get('/web-services', function () {
    return Inertia::render('web/Service');
})->name('web-services');

Route::get('/web-contacts', function () {
    return Inertia::render('web/web-contact');
})->name('web-contacts');


Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('dashboard', function () {
//        return Inertia::render('dashboard');
//    })->name('dashboard');

    Route::get('/dashboard', \App\Http\Controllers\DashboardController::class)
        ->name('dashboard');
});

require __DIR__ . '/settings.php';

Route::middleware(['auth', 'verified', 'role:super-admin'])->group(function () {
    Route::prefix('blogs')->name('blogs.')->group(function () {
        Route::get('/', [BlogController::class, 'index'])->name('index');
        Route::get('blogs/{blog:slug}', [BlogController::class, 'show'])->name('show');
        Route::get('/create', [BlogController::class, 'create'])->name('create');
        Route::post('/', [BlogController::class, 'store'])->name('store');
        Route::get('/{blog}/edit', [BlogController::class, 'edit'])->name('edit');
        Route::match(['put', 'patch'], '/{blog}', [BlogController::class, 'update'])
            ->name('update');
        Route::delete('/{blog}', [BlogController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [BlogController::class, 'restore'])->name('restore');
        Route::get('/trash', [BlogController::class, 'trash'])->name('trash');
        Route::delete('{id}/force-delete', [BlogController::class, 'forceDelete'])
            ->name('forceDelete');
    });
});


Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/contacts/search', ContactSearchController::class)
        ->name('contacts.search');

    // Contact Types
    Route::resource('contact-types', ContactTypeController::class)->except(['show']);
    Route::get('contact-types/trash', [ContactTypeController::class, 'trash'])->name('contact-types.trash');
    Route::post('contact-types/{id}/restore', [ContactTypeController::class, 'restore'])->name('contact-types.restore');
    Route::delete('contact-types/{id}/force', [ContactTypeController::class, 'forceDelete'])->name('contact-types.forceDelete');

    // Contacts
    Route::resource('contacts', ContactController::class);
    Route::get('contacts/trash', [ContactController::class, 'trash'])->name('contacts.trash');
    Route::post('contacts/{id}/restore', [ContactController::class, 'restore'])->name('contacts.restore');
    Route::delete('contacts/{id}/force', [ContactController::class, 'forceDelete'])->name('contacts.forceDelete');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('service_inwards', ServiceInwardController::class)
        ->names('service_inwards');

    Route::post('service_inwards/{id}/restore', [ServiceInwardController::class, 'restore'])
        ->name('service_inwards.restore');

    Route::delete('service_inwards/{id}/force', [ServiceInwardController::class, 'forceDelete'])
        ->name('service_inwards.forceDelete');

    Route::get('service_inwards/trash', [ServiceInwardController::class, 'trash'])
        ->name('service_inwards.trash');

    Route::get('/test-inertia', function () {
        return Inertia::render('ServiceInwards/Trash', [
            'inwards' => ['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]
        ]);
    })->name('test.inertia');

    Route::get('/service-inwards/next-rma', [ServiceInwardController::class, 'nextRma'])
        ->name('service_inwards.nextRma');

    Route::get('/service-inwards/search', [App\Http\Controllers\ServiceInwardController::class, 'search'])
        ->name('service_inwards.search');

});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('job_cards', JobCardController::class)->names('job_cards');

    Route::get('job_cards/trash', [JobCardController::class, 'trash'])
        ->name('job_cards.trash');

    Route::post('job_cards/{id}/restore', [JobCardController::class, 'restore'])
        ->name('job_cards.restore');

    Route::delete('job_cards/{id}/force', [JobCardController::class, 'forceDelete'])
        ->name('job_cards.forceDelete');

    Route::resource('service_statuses', ServiceStatusController::class)
        ->names('service_statuses');
});

Route::middleware(['auth', 'verified'])
    ->prefix('users')
    ->name('users.')
    ->group(function () {

        Route::get('/', [App\Http\Controllers\UserController::class, 'index'])
            ->name('index');

        Route::get('create', [App\Http\Controllers\UserController::class, 'create'])
            ->name('create');
        Route::post('/', [App\Http\Controllers\UserController::class, 'store'])
            ->name('store');

        Route::get('{user}', [App\Http\Controllers\UserController::class, 'show'])
            ->name('show');

        Route::get('{user}/edit', [App\Http\Controllers\UserController::class, 'edit'])
            ->name('edit');
        Route::match(['put', 'patch'], '{user}', [App\Http\Controllers\UserController::class, 'update'])
            ->name('update');

        Route::delete('{user}', [App\Http\Controllers\UserController::class, 'destroy'])
            ->name('destroy');

        // Trash
        Route::get('trash', [App\Http\Controllers\UserController::class, 'trash'])
            ->name('trash');
        Route::post('{id}/restore', [App\Http\Controllers\UserController::class, 'restore'])
            ->name('restore');
        Route::delete('{id}/force', [App\Http\Controllers\UserController::class, 'forceDelete'])
            ->name('forceDelete');
    });


Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('job_assignments', JobAssignmentController::class)
        ->names('job_assignments');

    Route::post('job_assignments/{id}/restore', [JobAssignmentController::class, 'restore'])
        ->name('job_assignments.restore');

    Route::delete('job_assignments/{id}/force', [JobAssignmentController::class, 'forceDelete'])
        ->name('job_assignments.forceDelete');

    Route::get('job_assignments/trash', [JobAssignmentController::class, 'trash'])
        ->name('job_assignments.trash');

});
