<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;

class ProdukController extends Controller
{
    /**
     * Get all products for the user's UMKM.
     */
    public function index(Request $request)
    {
        $umkm = $request->user()->umkm ?? $request->user()->ownedUmkm;

        if (!$umkm) {
            return response()->json(['message' => 'UMKM not found'], 404);
        }

        $produks = $umkm->produks()->with(['resep.bahanBaku'])->get();

        return response()->json([
            'message' => 'Produk retrieved successfully',
            'produk'  => $produks,
        ], 200);
    }

    /**
     * Store a newly created product in storage. (Owner only)
     */
    public function store(Request $request)
    {
        $umkm = $request->user()->ownedUmkm;

        if (!$umkm) {
            return response()->json(['message' => 'You must create a UMKM first'], 403);
        }

        $validated = $request->validate([
            'nama'      => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'required|numeric|min:0',
        ]);

        $produk = Produk::create([
            'umkm_id'   => $umkm->id,
            'nama'      => $validated['nama'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'harga'     => $validated['harga'],
        ]);

        return response()->json([
            'message' => 'Produk created successfully',
            'produk'  => $produk,
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show(Request $request, $id)
    {
        $umkm = $request->user()->umkm ?? $request->user()->ownedUmkm;
        
        $produk = Produk::with(['resep.bahanBaku'])
            ->where('id', $id)
            ->where('umkm_id', $umkm->id ?? null)
            ->first();

        if (!$produk) {
            return response()->json(['message' => 'Produk not found'], 404);
        }

        return response()->json([
            'message' => 'Produk retrieved successfully',
            'produk'  => $produk,
        ], 200);
    }

    /**
     * Update the specified product in storage. (Owner only)
     */
    public function update(Request $request, $id)
    {
        $umkm = $request->user()->ownedUmkm;

        $produk = Produk::where('id', $id)->where('umkm_id', $umkm->id ?? null)->first();

        if (!$produk) {
            return response()->json(['message' => 'Produk not found or unauthorized'], 404);
        }

        $validated = $request->validate([
            'nama'      => 'sometimes|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga'     => 'sometimes|numeric|min:0',
        ]);

        $produk->update($validated);

        return response()->json([
            'message' => 'Produk updated successfully',
            'produk'  => $produk,
        ], 200);
    }

    /**
     * Remove the specified product from storage. (Owner only)
     */
    public function destroy(Request $request, $id)
    {
        $umkm = $request->user()->ownedUmkm;

        $produk = Produk::where('id', $id)->where('umkm_id', $umkm->id ?? null)->first();

        if (!$produk) {
            return response()->json(['message' => 'Produk not found or unauthorized'], 404);
        }

        $produk->delete();

        return response()->json([
            'message' => 'Produk deleted successfully',
        ], 200);
    }
}
