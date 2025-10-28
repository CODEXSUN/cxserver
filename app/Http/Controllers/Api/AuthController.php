<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource; // ← Import the resource
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

        $user = Auth::guard('web')->user();
        $token = $user->createToken('erp-token')->plainTextToken;  // Sanctum token generation

        // Load roles with permissions (custom RBAC)
        $user->load('roles.permissions');

        // Load roles and return via UserResource (same format as UserController)
        return response()->json([
            'user' => new UserResource($user->load('roles')),
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
