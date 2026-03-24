<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BahanBakuController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\ResepProdukController;
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
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Super Admin routes
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'index']);
        
        // Manage Users (Owners mostly)
        Route::get('/admin/users', [AdminController::class, 'indexUsers']);
        Route::put('/admin/users/{id}', [AdminController::class, 'updateOwner']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteOwner']);
    });

    // Owner routes
    Route::middleware('role:owner')->group(function () {
        Route::get('/owner/dashboard', [OwnerController::class, 'index']);

        // UMKM management
        Route::post('/owner/umkm', [UmkmController::class, 'store']);
        Route::get('/owner/umkm', [UmkmController::class, 'show']);
        Route::put('/owner/umkm', [UmkmController::class, 'update']);

        // Staff management
        Route::post('/owner/staff', [OwnerController::class, 'createStaff']);
        Route::get('/owner/staff', [OwnerController::class, 'indexStaff']);
        Route::put('/owner/staff/{id}', [OwnerController::class, 'updateStaff']);
        Route::delete('/owner/staff/{id}', [OwnerController::class, 'deleteStaff']);

        // Master Data: Bahan Baku
        Route::get('/owner/bahan-baku', [BahanBakuController::class, 'index']);
        Route::post('/owner/bahan-baku', [BahanBakuController::class, 'store']);
        Route::get('/owner/bahan-baku/{id}', [BahanBakuController::class, 'show']);
        Route::put('/owner/bahan-baku/{id}', [BahanBakuController::class, 'update']);
        Route::delete('/owner/bahan-baku/{id}', [BahanBakuController::class, 'destroy']);

        // Master Data: Produk
        Route::get('/owner/produk', [ProdukController::class, 'index']);
        Route::post('/owner/produk', [ProdukController::class, 'store']);
        Route::get('/owner/produk/{id}', [ProdukController::class, 'show']);
        Route::put('/owner/produk/{id}', [ProdukController::class, 'update']);
        Route::delete('/owner/produk/{id}', [ProdukController::class, 'destroy']);

        // Master Data: Resep
        Route::post('/owner/produk/{produk_id}/resep', [ResepProdukController::class, 'store']);
        Route::put('/owner/resep/{id}', [ResepProdukController::class, 'update']);
        Route::delete('/owner/resep/{id}', [ResepProdukController::class, 'destroy']);
    });

    // Staff routes
    Route::middleware('role:staff')->group(function () {
        Route::get('/staff/dashboard', [StaffController::class, 'index']);

        // Master Data (Read-only)
        Route::get('/staff/bahan-baku', [BahanBakuController::class, 'index']);
        Route::get('/staff/bahan-baku/{id}', [BahanBakuController::class, 'show']);
        Route::get('/staff/produk', [ProdukController::class, 'index']);
        Route::get('/staff/produk/{id}', [ProdukController::class, 'show']);
    });
});
