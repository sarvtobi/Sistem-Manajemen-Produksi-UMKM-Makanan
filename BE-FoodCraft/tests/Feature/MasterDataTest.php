<?php

use App\Models\User;
use App\Models\Umkm;
use App\Models\BahanBaku;
use App\Models\Produk;
use App\Models\ResepProduk;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function createMasterDataOwner(): array
{
    $owner = User::factory()->create(['role' => 'owner']);
    $umkm = Umkm::create([
        'name'     => 'UMKM Master Data',
        'owner_id' => $owner->id,
    ]);
    $token = $owner->createToken('test_token')->plainTextToken;

    return [$owner, $umkm, $token];
}

function createMasterDataStaff($umkm_id): array
{
    $staff = User::factory()->create([
        'role'    => 'staff',
        'umkm_id' => $umkm_id,
    ]);
    $token = $staff->createToken('staff_token')->plainTextToken;

    return [$staff, $token];
}

/*
|--------------------------------------------------------------------------
| Bahan Baku Tests
|--------------------------------------------------------------------------
*/

test('owner can create bahan baku', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson('/api/owner/bahan-baku', [
        'nama'         => 'Tepung Terigu',
        'satuan'       => 'kg',
        'stok'         => 10.5,
        'stok_minimum' => 2.0,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['message', 'bahan_baku' => ['id', 'nama', 'satuan']])
        ->assertJsonPath('bahan_baku.nama', 'Tepung Terigu');

    $this->assertDatabaseHas('bahan_bakus', [
        'nama'    => 'Tepung Terigu',
        'umkm_id' => $umkm->id,
    ]);
});

test('owner can view their bahan baku', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();
    BahanBaku::create(['umkm_id' => $umkm->id, 'nama' => 'Gula', 'satuan' => 'kg']);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/owner/bahan-baku');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'bahan_baku');
});

test('staff can view umkm bahan baku', function () {
    [$owner, $umkm, $ownerToken] = createMasterDataOwner();
    BahanBaku::create(['umkm_id' => $umkm->id, 'nama' => 'Telur', 'satuan' => 'butir']);
    
    [$staff, $staffToken] = createMasterDataStaff($umkm->id);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $staffToken,
    ])->getJson('/api/staff/bahan-baku');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'bahan_baku')
        ->assertJsonPath('bahan_baku.0.nama', 'Telur');
});

test('staff cannot create bahan baku', function () {
    [$owner, $umkm, $ownerToken] = createMasterDataOwner();
    [$staff, $staffToken] = createMasterDataStaff($umkm->id);

    // Endpoint owner/bahan-baku belongs to owner role
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $staffToken,
    ])->postJson('/api/owner/bahan-baku', [
        'nama'   => 'Susu',
        'satuan' => 'liter',
    ]);

    $response->assertStatus(403);
});

/*
|--------------------------------------------------------------------------
| Produk Tests
|--------------------------------------------------------------------------
*/

test('owner can create produk', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson('/api/owner/produk', [
        'nama'      => 'Kue Bolu',
        'deskripsi' => 'Kue bolu enak',
        'harga'     => 25000,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('produk.nama', 'Kue Bolu');

    $this->assertDatabaseHas('produks', [
        'nama'    => 'Kue Bolu',
        'umkm_id' => $umkm->id,
    ]);
});

test('owner can view produk with resep', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();
    $produk = Produk::create(['umkm_id' => $umkm->id, 'nama' => 'Produk A', 'harga' => 1000]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson("/api/owner/produk/{$produk->id}");

    $response->assertStatus(200)
        ->assertJsonStructure(['message', 'produk' => ['resep']]);
});

/*
|--------------------------------------------------------------------------
| Resep Produk Tests
|--------------------------------------------------------------------------
*/

test('owner can add bahan baku to produk resep', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();
    $produk = Produk::create(['umkm_id' => $umkm->id, 'nama' => 'Kue A', 'harga' => 1000]);
    $bahan = BahanBaku::create(['umkm_id' => $umkm->id, 'nama' => 'Tepung A', 'satuan' => 'kg']);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson("/api/owner/produk/{$produk->id}/resep", [
        'bahan_baku_id' => $bahan->id,
        'kuantitas'     => 0.5,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('resep.kuantitas', 0.5);

    $this->assertDatabaseHas('resep_produks', [
        'produk_id'     => $produk->id,
        'bahan_baku_id' => $bahan->id,
        'kuantitas'     => 0.5,
    ]);
});

test('owner cannot add same bahan baku twice to resep', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();
    $produk = Produk::create(['umkm_id' => $umkm->id, 'nama' => 'Kue A', 'harga' => 1000]);
    $bahan = BahanBaku::create(['umkm_id' => $umkm->id, 'nama' => 'Tepung A', 'satuan' => 'kg']);

    ResepProduk::create(['produk_id' => $produk->id, 'bahan_baku_id' => $bahan->id, 'kuantitas' => 0.5]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson("/api/owner/produk/{$produk->id}/resep", [
        'bahan_baku_id' => $bahan->id,
        'kuantitas'     => 0.2,
    ]);

    $response->assertStatus(409); // Conflict
});

test('owner can update resep kuantitas', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();
    $produk = Produk::create(['umkm_id' => $umkm->id, 'nama' => 'Kue A', 'harga' => 1000]);
    $bahan = BahanBaku::create(['umkm_id' => $umkm->id, 'nama' => 'Tepung A', 'satuan' => 'kg']);
    $resep = ResepProduk::create(['produk_id' => $produk->id, 'bahan_baku_id' => $bahan->id, 'kuantitas' => 0.5]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->putJson("/api/owner/resep/{$resep->id}", [
        'kuantitas' => 1.5,
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('resep.kuantitas', 1.5);
});

test('owner can delete bahan baku from resep', function () {
    [$owner, $umkm, $token] = createMasterDataOwner();
    $produk = Produk::create(['umkm_id' => $umkm->id, 'nama' => 'Kue A', 'harga' => 1000]);
    $bahan = BahanBaku::create(['umkm_id' => $umkm->id, 'nama' => 'Tepung A', 'satuan' => 'kg']);
    $resep = ResepProduk::create(['produk_id' => $produk->id, 'bahan_baku_id' => $bahan->id, 'kuantitas' => 0.5]);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->deleteJson("/api/owner/resep/{$resep->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('resep_produks', ['id' => $resep->id]);
});

test('owner cannot modify other umkm resep', function () {
    // Current owner
    [$owner, $umkm, $token] = createMasterDataOwner();

    // Other owner
    $otherOwner = User::factory()->create(['role' => 'owner']);
    $otherUmkm = Umkm::create(['name' => 'Other', 'owner_id' => $otherOwner->id]);
    
    $otherProduk = Produk::create(['umkm_id' => $otherUmkm->id, 'nama' => 'Other Kue', 'harga' => 1000]);
    $otherBahan = BahanBaku::create(['umkm_id' => $otherUmkm->id, 'nama' => 'Other Tepung', 'satuan' => 'kg']);
    $otherResep = ResepProduk::create(['produk_id' => $otherProduk->id, 'bahan_baku_id' => $otherBahan->id, 'kuantitas' => 0.5]);

    // Current owner tries to delete other owner's resep
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->deleteJson("/api/owner/resep/{$otherResep->id}");

    $response->assertStatus(404); // Not found or unauthorized
});
