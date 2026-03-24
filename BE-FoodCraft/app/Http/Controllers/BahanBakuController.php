<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use Illuminate\Http\Request;

class BahanBakuController extends Controller
{
    /**
     * Get all raw materials for the user's UMKM.
     */
    public function index(Request $request)
    {
        $umkm = $request->user()->umkm ?? $request->user()->ownedUmkm;

        if (!$umkm) {
            return response()->json(['message' => 'UMKM not found'], 404);
        }

        $bahanBakus = $umkm->bahanBakus;

        return response()->json([
            'message'    => 'Bahan Baku retrieved successfully',
            'bahan_baku' => $bahanBakus,
        ], 200);
    }

    /**
     * Store a newly created raw material in storage. (Owner only)
     */
    public function store(Request $request)
    {
        $umkm = $request->user()->ownedUmkm;

        if (!$umkm) {
            return response()->json(['message' => 'You must create a UMKM first'], 403);
        }

        $validated = $request->validate([
            'nama'         => 'required|string|max:255',
            'satuan'       => 'required|string|max:50',
            'stok'         => 'nullable|numeric|min:0',
            'stok_minimum' => 'nullable|numeric|min:0',
        ]);

        $bahanBaku = BahanBaku::create([
            'umkm_id'      => $umkm->id,
            'nama'         => $validated['nama'],
            'satuan'       => $validated['satuan'],
            'stok'         => $validated['stok'] ?? 0,
            'stok_minimum' => $validated['stok_minimum'] ?? 0,
        ]);

        return response()->json([
            'message'    => 'Bahan Baku created successfully',
            'bahan_baku' => $bahanBaku,
        ], 201);
    }

    /**
     * Display the specified raw material.
     */
    public function show(Request $request, $id)
    {
        $umkm = $request->user()->umkm ?? $request->user()->ownedUmkm;
        
        $bahanBaku = BahanBaku::where('id', $id)->where('umkm_id', $umkm->id ?? null)->first();

        if (!$bahanBaku) {
            return response()->json(['message' => 'Bahan Baku not found'], 404);
        }

        return response()->json([
            'message'    => 'Bahan Baku retrieved successfully',
            'bahan_baku' => $bahanBaku,
        ], 200);
    }

    /**
     * Update the specified raw material in storage. (Owner only)
     */
    public function update(Request $request, $id)
    {
        $umkm = $request->user()->ownedUmkm;

        $bahanBaku = BahanBaku::where('id', $id)->where('umkm_id', $umkm->id ?? null)->first();

        if (!$bahanBaku) {
            return response()->json(['message' => 'Bahan Baku not found or unauthorized'], 404);
        }

        $validated = $request->validate([
            'nama'         => 'sometimes|string|max:255',
            'satuan'       => 'sometimes|string|max:50',
            'stok'         => 'sometimes|numeric|min:0',
            'stok_minimum' => 'sometimes|numeric|min:0',
        ]);

        $bahanBaku->update($validated);

        return response()->json([
            'message'    => 'Bahan Baku updated successfully',
            'bahan_baku' => $bahanBaku,
        ], 200);
    }

    /**
     * Remove the specified raw material from storage. (Owner only)
     */
    public function destroy(Request $request, $id)
    {
        $umkm = $request->user()->ownedUmkm;

        $bahanBaku = BahanBaku::where('id', $id)->where('umkm_id', $umkm->id ?? null)->first();

        if (!$bahanBaku) {
            return response()->json(['message' => 'Bahan Baku not found or unauthorized'], 404);
        }

        $bahanBaku->delete();

        return response()->json([
            'message' => 'Bahan Baku deleted successfully',
        ], 200);
    }
}
