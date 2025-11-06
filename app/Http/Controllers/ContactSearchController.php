<?php

// app/Http/Controllers/ContactSearchController.php
namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactSearchController extends Controller
{
// app/Http/Controllers/ContactSearchController.php
    public function __invoke(Request $request)
    {
        $query = $request->query('q', '');

        $contacts = Contact::query()
            ->with('contactType')
            ->when($query, function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('mobile', 'like', "%{$query}%")  // ← Use mobile
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('phone', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'email', 'phone', 'mobile', 'company', 'contact_type_id'])
            ->limit(10)
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'mobile' => $contact->mobile,
                    'company' => $contact->company,
                    'contact_type' => [
                        'id' => $contact->contact_type_id,
                        'name' => $contact->contactType?->name ?? 'Unknown'
                    ]
                ];
            });

        return response()->json([
            'contacts' => $contacts
        ]);
    }
}
