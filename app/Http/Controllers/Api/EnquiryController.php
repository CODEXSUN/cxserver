<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Database\QueryException;

class EnquiryController extends Controller
{

    public function index(Request $request)
    {
        $query = Enquiry::with('contact')->latest();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('query', 'like', "%{$search}%")
                    ->orWhereHas('contact', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $perPage = $request->get('per_page', 20);
        $page = $request->get('page', 1);

        $enquiries = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $enquiries->items(),
            'meta' => [
                'current_page' => $enquiries->currentPage(),
                'last_page' => $enquiries->lastPage(),
                'per_page' => $enquiries->perPage(),
                'total' => $enquiries->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'required|string|regex:/^\+?\d{10,15}$/',
                'company_name' => 'nullable|string|max:255',
                'query' => 'required|string',
                'email' => 'nullable|email',
                'contact_type' => 'sometimes|required|in:customer,supplier,both',
                'grant_portal_access' => 'sometimes|boolean',
            ]);

            return DB::transaction(function () use ($request) {
                // Find contact
                $contact = Contact::where('phone', $request->input('phone'))->first();

                // Fallback: email + name
                if (!$contact && $request->filled('email')) {
                    $contact = Contact::where('email', $request->input('email'))
                        ->where('name', $request->input('name'))
                        ->first();
                }

                // Create new contact
                if (!$contact) {
                    $type = $request->input('contact_type', 'customer');
                    $prefix = strtoupper(substr($type, 0, 4));

                    $last = Contact::where('contact_type', $type)
                        ->where('contact_code', 'like', $prefix . '-%')
                        ->max(DB::raw('CAST(SUBSTRING(contact_code, LOCATE(\'-\', contact_code)+1) AS UNSIGNED)')) ?? 0;

                    $contact_code = sprintf('%s-%04d', $prefix, $last + 1);

                    $contact = Contact::create([
                        'contact_code' => $contact_code,
                        'name' => $request->input('name'),
                        'phone' => $request->input('phone'),
                        'email' => $request->input('email'),
                        'contact_type' => $type,
                        'has_account' => false,
                    ]);
                } else {
                    $contact->update([
                        'email' => $request->input('email') ?? $contact->email,
                        'contact_type' => $request->input('contact_type', $contact->contact_type),
                    ]);
                }

                // Create enquiry
                $enquiry = Enquiry::create([
                    'contact_id' => $contact->id,
                    'query' => $request->input('query'),
                ]);

                // Portal access
                $portal = null;
                if ($request->boolean('grant_portal_access')) {
                    if (!$contact->email) {
                        throw ValidationException::withMessages(['email' => 'Email required for portal access.']);
                    }
                    $portal = ['message' => 'Portal access will be created later.'];
                }

                return response()->json([
                    'enquiry' => $enquiry->load('contact'),
                    'contact' => $contact,
                    'portal' => $portal,
                ], 201);
            });
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error',
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ], 500);
        } catch (Exception $e) {
            \Log::error('Enquiry creation failed', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->except('password'),
            ]);

            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}
