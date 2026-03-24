<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use App\Models\Produk;
use App\Models\ResepProduk;
use Illuminate\Http\Request;

class ResepProdukController extends Controller
{
    /**
     * Add an ingredient (bahan baku) to a product's recipe.
     * POST /api/owner/produk/{produk_id}/resep
     */
    public function store(Request $request, $produk_id)
    {
        $umkm = $request->user()->ownedUmkm;

        $produk = Produk::where('id', $produk_id)->where('umkm_id', $umkm->id ?? null)->first();

        if (!$produk) {
            return response()->json(['message' => 'Produk not found or unauthorized'], 404);
        }

        $validated = $request->validate([
            'bahan_baku_id' => 'required|exists:bahan_bakus,id',
            'kuantitas'     => 'required|numeric|min:0.01',
        ]);

        // Pastikan bahan baku juga milik UMKM ini
        $bahanBaku = BahanBaku::where('id', $validated['bahan_baku_id'])
            ->where('umkm_id', $umkm->id)
            ->first();

        if (!$bahanBaku) {
            return response()->json(['message' => 'Bahan Baku invalid or unauthorized'], 400);
        }

        // Cek apakah bahan baku sudah ada di resep untuk produk ini
        $existingResep = ResepProduk::where('produk_id', $produk->id)
            ->where('bahan_baku_id', $bahanBaku->id)
            ->first();

        if ($existingResep) {
            return response()->json(['message' => 'Bahan Baku ini sudah ada di resep, silakan update resep tersebut'], 409);
        }

        $resep = ResepProduk::create([
            'produk_id'     => $produk->id,
            'bahan_baku_id' => $bahanBaku->id,
            'kuantitas'     => $validated['kuantitas'],
        ]);

        return response()->json([
            'message' => 'Bahan Baku berhasil ditambahkan ke resep',
            'resep'   => $resep,
        ], 201);
    }

    /**
     * Update the quantity of an ingredient in the recipe.
     * PUT /api/owner/resep/{id}
     */
    public function update(Request $request, $id)
    {
        $umkm = $request->user()->ownedUmkm;

        $resep = ResepProduk::with('produk')->where('id', $id)->first();

        if (!$resep || !$resep->produk || $resep->produk->umkm_id !== ($umkm->id ?? null)) {
            return response()->json(['message' => 'Resep not found or unauthorized'], 404);
        }

        $validated = $request->validate([
            'kuantitas' => 'required|numeric|min:0.01',
        ]);

        $resep->update(['kuantitas' => $validated['kuantitas']]);

        return response()->json([
            'message' => 'Kuantitas resep berhasil diupdate',
            'resep'   => $resep,
        ], 200);
    }

    /**
     * Remove an ingredient from the recipe.
     * DELETE /api/owner/resep/{id}
     */
    public function destroy(Request $request, $id)
    {
        $umkm = $request->user()->ownedUmkm;

        $resep = ResepProduk::with('produk')->where('id', $id)->first();

        if (!$resep || !$resep->produk || $resep->produk->umkm_id !== ($umkm->id ?? null)) {
            return response()->json(['message' => 'Resep not found or unauthorized'], 404);
        }

        $resep->delete();

        return response()->json([
            'message' => 'Bahan baku berhasil dihapus dari resep',
        ], 200);
    }
}
