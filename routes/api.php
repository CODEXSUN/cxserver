<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PriorityController;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


//Route::middleware(['auth:sanctum', 'permission:view_posts'])->get('/posts', [PostController::class, 'index']);

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
