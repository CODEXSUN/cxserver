<?php

// app/Http/Controllers/EnquiryController.php
namespace App\Http\Controllers;

use App\Models\CallLog;
use App\Models\Contact;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class EnquiryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', CallLog::class);

        if ($request->filled('contact_id')) {
            $contact = Contact::findOrFail($request->contact_id);

            $callLogsQuery = $contact->callLogs()->with(['handler'])
                ->when($request->filled('date_from'), fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
                ->when($request->filled('date_to'), fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
                ->latest();

            $data = [
                'contact' => $contact,
                'call_logs' => $callLogsQuery->get(),
                'service_inwards' => $contact->serviceInwards()->get(), // Assuming relationship
                'job_cards' => $contact->jobCards()->get(), // Assuming relationship
                // Add more histories as needed
                'filters' => $request->only(['contact_id', 'date_from', 'date_to']),
                'can' => [
                    'create' => Gate::allows('create', CallLog::class),
                    'delete' => Gate::allows('delete', CallLog::class),
                ],
            ];
        } else {
            $data = [
                'contact' => null,
                'call_logs' => [],
                'service_inwards' => [],
                'job_cards' => [],
                'filters' => [],
                'can' => [
                    'create' => Gate::allows('create', CallLog::class),
                    'delete' => Gate::allows('delete', CallLog::class),
                ],
            ];
        }

        return Inertia::render('Enquiry/Index', $data);
    }
}
