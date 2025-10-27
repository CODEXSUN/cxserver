<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::guard('web')->attempt($credentials)) {  // Use 'web' guard here
            return response()->json(['message' => 'These credentials do not match our records.'], 401);
        }

        $user = Auth::guard('web')->user();  // Retrieve user via 'web' guard
        $token = $user->createToken('erp-token')->plainTextToken;  // Sanctum token generation

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

// Bonus: Logout method to revoke token
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
