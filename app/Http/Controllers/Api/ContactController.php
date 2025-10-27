<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    /**
     * POST /api/contacts
     * Create or find contact (for enquiry linkage)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|regex:/^\+?[0-9]{10,15}$/|unique:contacts,phone',
            'email' => 'nullable|email|unique:contacts,email',
            'contact_type' => 'required|in:customer,supplier,both',
        ]);

        return DB::transaction(function () use ($request) {
            // Find by phone
            $contact = Contact::where('phone', $request->phone)->first();

            // Fallback: email + name
            if (!$contact && $request->filled('email')) {
                $contact = Contact::where('email', $request->email)
                    ->where('name', $request->name)
                    ->first();
            }

            if ($contact) {
                // Update optional fields
                $contact->update([
                    'email' => $request->email ?? $contact->email,
                    'contact_type' => $request->contact_type,
                ]);
                return response()->json(['contact' => $contact->load('detail')], 200);
            }

            // Generate contact_code
            $prefix = strtoupper(substr($request->contact_type, 0, 4)); // CUST / SUPP / BOTH
            $last = Contact::where('contact_type', $request->contact_type)
                ->where('contact_code', 'like', "{$prefix}-%")
                ->max(DB::raw('CAST(SUBSTRING(contact_code, 6) AS UNSIGNED)')) ?? 0;

            $contact_code = sprintf('%s-%04d', $prefix, $last + 1);

            $contact = Contact::create([
                'contact_code' => $contact_code,
                'name' => $request->name,
                'phone' => $request->phone,
                'email' => $request->email,
                'contact_type' => $request->contact_type,
                'has_account' => false,
            ]);

            return response()->json(['contact' => $contact], 201);
        });
    }

    /**
     * GET /api/contacts/{id}
     */
    public function show(Contact $contact)
    {
        return response()->json(['contact' => $contact->load('detail', 'enquiries')]);
    }

    // app/Http/Controllers/Api/ContactController.php (add method)
    public function lookup(Request $request)
    {
        return response()->json(['contact' => "sundar"], 200);

        $request->validate([
            'phone' => 'required|string|regex:/^\+?[0-9]{10,15}$/',
        ]);

        $contact = Contact::with('detail')
            ->where('phone', $request->query('phone'))
            ->first();

        if (! $contact) {
            return response()->json(['contact' => null], 200);
        }

        return response()->json(['contact' => $contact], 200);
    }
}
