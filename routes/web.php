<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactTypeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified','role:super-admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';

Route::middleware(['auth', 'verified','role:super-admin'])->group(function () {
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
