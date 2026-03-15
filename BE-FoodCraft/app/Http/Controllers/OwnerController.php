<?php

namespace App\Http\Controllers;

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
}
