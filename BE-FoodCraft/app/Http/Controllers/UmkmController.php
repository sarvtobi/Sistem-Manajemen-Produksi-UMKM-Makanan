<?php

namespace App\Http\Controllers;

use App\Models\Umkm;
use Illuminate\Http\Request;

class UmkmController extends Controller
{
    /**
     * Owner membuat UMKM baru.
     *
     * POST /api/owner/umkm
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Cek apakah owner sudah punya UMKM
        if ($user->ownedUmkm) {
            return response()->json([
                'message' => 'You already have a UMKM registered',
            ], 409);
        }

        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone'   => 'nullable|string|max:20',
        ]);

        $umkm = Umkm::create([
            'name'     => $validated['name'],
            'address'  => $validated['address'] ?? null,
            'phone'    => $validated['phone'] ?? null,
            'owner_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'UMKM created successfully',
            'umkm'    => $umkm,
        ], 201);
    }

    /**
     * Owner melihat data UMKM-nya.
     *
     * GET /api/owner/umkm
     */
    public function show(Request $request)
    {
        $umkm = $request->user()->ownedUmkm;

        if (!$umkm) {
            return response()->json([
                'message' => 'You have not registered a UMKM yet',
            ], 404);
        }

        $umkm->load('staffs');

        return response()->json([
            'message' => 'UMKM retrieved successfully',
            'umkm'    => $umkm,
        ], 200);
    }
}
