<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EnquiryController extends Controller
{
    /**
     * POST /api/enquiries
     * Body: { name, phone, company_name?, query, email?, grant_portal_access? }
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|regex:/^\+?[0-9]{10,15}$/',
            'company_name' => 'nullable|string|max:255',
            'query' => 'required|string',
            'email' => 'nullable|email',
            'contact_type' => 'sometimes|required|in:customer,supplier,both',
            'grant_portal_access' => 'sometimes|boolean',
        ]);

        return DB::transaction(function () use ($request) {
            // Step 1: Find or create Contact
            $contact = Contact::where('phone', $request->phone)->first();

            if (!$contact && $request->filled('email')) {
                $contact = Contact::where('email', $request->email)
                    ->where('name', $request->name)
                    ->first();
            }

            if (!$contact) {
                // Generate contact_code
                $type = $request->input('contact_type', 'customer');
                $prefix = strtoupper(substr($type, 0, 4));
                $last = Contact::where('contact_type', $type)
                    ->where('contact_code', 'like', "{$prefix}-%")
                    ->max(DB::raw('CAST(SUBSTRING(contact_code, 6) AS UNSIGNED)')) ?? 0;

                $contact_code = sprintf('%s-%04d', $prefix, $last + 1);

                $contact = Contact::create([
                    'contact_code' => $contact_code,
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'email' => $request->email,
                    'contact_type' => $type,
                    'has_account' => false,
                ]);
            } else {
                // Update optional fields
                $contact->update([
                    'email' => $request->email ?? $contact->email,
                    'contact_type' => $request->input('contact_type', $contact->contact_type),
                ]);
            }

            // Step 2: Create Enquiry
            $enquiry = Enquiry::create([
                'contact_id' => $contact->id,
                'query' => $request->query,
            ]);

            // Step 3: Optional - Grant Portal Access (stub for now)
            $portalInfo = null;
            if ($request->boolean('grant_portal_access')) {
                if (!$contact->email) {
                    throw ValidationException::withMessages([
                        'email' => 'Email is required to grant portal access.'
                    ]);
                }
                $portalInfo = [
                    'message' => 'Portal access will be created (User model pending).',
                    'login_url' => url('/portal/login'),
                ];
            }

            return response()->json([
                'enquiry' => $enquiry->load('contact'),
                'contact' => $contact,
                'portal' => $portalInfo,
            ], 201);
        });
    }

    /**
     * GET /api/enquiries/{id}
     */
    public function show(Enquiry $enquiry)
    {
        return response()->json($enquiry->load('contact'));
    }

    /**
     * GET /api/contacts/{contact}/enquiries
     */
    public function byContact(Contact $contact)
    {
        return response()->json(
            $contact->enquiries()->latest()->paginate(10)
        );
    }
}
