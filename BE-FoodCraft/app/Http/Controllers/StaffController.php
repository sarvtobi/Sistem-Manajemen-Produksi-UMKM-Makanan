<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * Staff Dashboard.
     *
     * GET /api/staff/dashboard
     */
    public function index(Request $request)
    {
        return response()->json([
            'message' => 'Welcome Staff Dashboard',
            'user'    => $request->user(),
        ], 200);
    }
}
