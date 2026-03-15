<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Register Tests
|--------------------------------------------------------------------------
*/

test('user can register successfully', function () {
    $response = $this->postJson('/api/register', [
        'name'     => 'Test User',
        'email'    => 'test@example.com',
        'password' => 'password123',
        'role'     => 'owner',
        'umkm_id'  => 1,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role', 'umkm_id'],
        ])
        ->assertJson([
            'message' => 'User registered successfully',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'role'  => 'owner',
    ]);
});

test('register fails with duplicate email', function () {
    User::factory()->create(['email' => 'duplicate@example.com']);

    $response = $this->postJson('/api/register', [
        'name'     => 'Test User',
        'email'    => 'duplicate@example.com',
        'password' => 'password123',
        'role'     => 'staff',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('register fails with password too short', function () {
    $response = $this->postJson('/api/register', [
        'name'     => 'Test User',
        'email'    => 'test@example.com',
        'password' => '123',
        'role'     => 'staff',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

/*
|--------------------------------------------------------------------------
| Login Tests
|--------------------------------------------------------------------------
*/

test('user can login with valid credentials', function () {
    User::factory()->create([
        'email'    => 'login@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email'    => 'login@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'token',
            'user',
        ])
        ->assertJson([
            'message' => 'Login successful',
        ]);
});

test('login fails with wrong credentials', function () {
    User::factory()->create([
        'email'    => 'wrong@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email'    => 'wrong@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Invalid login credentials',
        ]);
});

/*
|--------------------------------------------------------------------------
| Logout Tests
|--------------------------------------------------------------------------
*/

test('authenticated user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson('/api/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Logged out successfully',
        ]);
});

/*
|--------------------------------------------------------------------------
| Profile Tests
|--------------------------------------------------------------------------
*/

test('authenticated user can get profile', function () {
    $user = User::factory()->create(['role' => 'owner']);
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/profile');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role'],
        ]);
});

test('unauthenticated user cannot get profile', function () {
    $response = $this->getJson('/api/profile');

    $response->assertStatus(401);
});

/*
|--------------------------------------------------------------------------
| RBAC Tests
|--------------------------------------------------------------------------
*/

test('super_admin can access admin dashboard', function () {
    $user = User::factory()->create(['role' => 'super_admin']);
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/admin/dashboard');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Welcome Super Admin Dashboard',
        ]);
});

test('owner cannot access admin dashboard', function () {
    $user = User::factory()->create(['role' => 'owner']);
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/admin/dashboard');

    $response->assertStatus(403);
});

test('owner can access owner dashboard', function () {
    $user = User::factory()->create(['role' => 'owner']);
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/owner/dashboard');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Welcome Owner Dashboard',
        ]);
});

test('staff can access staff dashboard', function () {
    $user = User::factory()->create(['role' => 'staff']);
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/staff/dashboard');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Welcome Staff Dashboard',
        ]);
});

test('staff cannot access owner dashboard', function () {
    $user = User::factory()->create(['role' => 'staff']);
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/owner/dashboard');

    $response->assertStatus(403);
});
