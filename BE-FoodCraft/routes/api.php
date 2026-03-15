<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\UmkmController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (no authentication required)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (requires auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Super Admin routes
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'index']);
    });

    // Owner routes
    Route::middleware('role:owner')->group(function () {
        Route::get('/owner/dashboard', [OwnerController::class, 'index']);

        // UMKM management
        Route::post('/owner/umkm', [UmkmController::class, 'store']);
        Route::get('/owner/umkm', [UmkmController::class, 'show']);

        // Staff management
        Route::post('/owner/staff', [OwnerController::class, 'createStaff']);
        Route::get('/owner/staff', [OwnerController::class, 'indexStaff']);
        Route::put('/owner/staff/{id}', [OwnerController::class, 'updateStaff']);
        Route::delete('/owner/staff/{id}', [OwnerController::class, 'deleteStaff']);
    });

    // Staff routes
    Route::middleware('role:staff')->group(function () {
        Route::get('/staff/dashboard', [StaffController::class, 'index']);
    });
});
