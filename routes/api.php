<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('todos', TodoController::class);
    Route::post('todos/reorder', [TodoController::class, 'reorder']);

    // New: Categories routes
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('priorities', PriorityController::class);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/assign-role', [UserController::class, 'assignRole']);
    Route::post('users/{id}/remove-role', [UserController::class, 'removeRole']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{id}/assign-permission', [RoleController::class, 'assignPermission']);
    Route::post('roles/{id}/remove-permission', [RoleController::class, 'removePermission']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('permissions', PermissionController::class);
    Route::post('permissions/{id}/assign-role', [PermissionController::class, 'assignRole']);
    Route::post('permissions/{id}/remove-role', [PermissionController::class, 'removeRole']);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('contacts', [ContactController::class, 'index'])
        ->middleware('permission:viewAny contacts');
    Route::post('contacts', [ContactController::class, 'store'])
        ->middleware('permission:create contacts');
    Route::get('contacts/{contact}', [ContactController::class, 'show'])
        ->middleware('permission:view contacts');
    Route::put('contacts/{contact}', [ContactController::class, 'update'])
        ->middleware('permission:update contacts');
    Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])
        ->middleware('permission:delete contacts');
    Route::post('contacts/{contact}/restore', [ContactController::class, 'restore'])
        ->middleware('permission:restore contacts');
});


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('enquiries', EnquiryController::class);
    Route::post('enquiries/{enquiry}/restore', [EnquiryController::class, 'restore']);
    Route::post('enquiries/{enquiry}/resolve', [EnquiryController::class, 'resolve']);
    Route::post('enquiries/{enquiry}/convert-to-project', [EnquiryController::class, 'convertToProject']);
});
