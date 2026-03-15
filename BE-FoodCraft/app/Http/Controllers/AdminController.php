<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Super Admin Dashboard.
     *
     * GET /api/admin/dashboard
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Welcome Super Admin Dashboard',
            'user'    => $request->user(),
        ], 200);
    }
}
