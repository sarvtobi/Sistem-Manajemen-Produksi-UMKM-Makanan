<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    /**
     * Owner Dashboard.
     *
     * GET /api/owner/dashboard
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Welcome Owner Dashboard',
            'user'    => $request->user(),
        ], 200);
    }

    /**
     * Owner mendaftarkan staff baru ke UMKM-nya.
     *
     * POST /api/owner/staff
     */
    public function createStaff(Request $request)
    {
        $owner = $request->user();
        $umkm = $owner->ownedUmkm;

        if (!$umkm) {
            return response()->json([
                'message' => 'You must create a UMKM first before adding staff',
            ], 403);
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $staff = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'role'     => User::ROLE_STAFF,
            'umkm_id'  => $umkm->id,
        ]);

        return response()->json([
            'message' => 'Staff created successfully',
            'staff'   => $staff,
        ], 201);
    }

    /**
     * Owner melihat semua staff di UMKM-nya.
     *
     * GET /api/owner/staff
     */
    public function indexStaff(Request $request)
    {
        $owner = $request->user();
        $umkm = $owner->ownedUmkm;

        if (!$umkm) {
            return response()->json([
                'message' => 'You must create a UMKM first',
            ], 403);
        }

        $staffs = $umkm->staffs;

        return response()->json([
            'message' => 'Staff list retrieved successfully',
            'staffs'  => $staffs,
        ], 200);
    }

    /**
     * Owner mengupdate data staff.
     *
     * PUT /api/owner/staff/{id}
     */
    public function updateStaff(Request $request, $id)
    {
        $owner = $request->user();
        $umkm = $owner->ownedUmkm;

        if (!$umkm) {
            return response()->json([
                'message' => 'You must create a UMKM first',
            ], 403);
        }

        $staff = User::where('id', $id)
            ->where('umkm_id', $umkm->id)
            ->where('role', User::ROLE_STAFF)
            ->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Staff not found in your UMKM',
            ], 404);
        }

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|string|email|max:255|unique:users,email,' . $staff->id,
            'password' => 'sometimes|string|min:6',
        ]);

        $staff->update($validated);

        return response()->json([
            'message' => 'Staff updated successfully',
            'staff'   => $staff,
        ], 200);
    }

    /**
     * Owner menghapus staff dari UMKM-nya.
     *
     * DELETE /api/owner/staff/{id}
     */
    public function deleteStaff(Request $request, $id)
    {
        $owner = $request->user();
        $umkm = $owner->ownedUmkm;

        if (!$umkm) {
            return response()->json([
                'message' => 'You must create a UMKM first',
            ], 403);
        }

        $staff = User::where('id', $id)
            ->where('umkm_id', $umkm->id)
            ->where('role', User::ROLE_STAFF)
            ->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Staff not found in your UMKM',
            ], 404);
        }

        $staff->delete();

        return response()->json([
            'message' => 'Staff deleted successfully',
        ], 200);
    }
}
