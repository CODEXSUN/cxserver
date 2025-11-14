<?php

namespace App\Http\Controllers;

use App\Models\CallLog;
use App\Models\CallLogNote;
use App\Models\Contact;
use App\Models\User;
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

        $perPage = (int)$request->input('per_page', 100);
        $perPage = in_array($perPage, [10, 25, 50, 100, 200]) ? $perPage : 100;

        $query = CallLog::with(['contact', 'handler'])
            ->when($request->filled('search'), fn($q) => $q->where(function ($q) use ($request) {
                $search = $request->search;
                $q->where('mobile', 'like', "%{$search}%")
                    ->orWhere('enquiry', 'like', "%{$search}%")
                    ->orWhereHas('contact', fn($cq) => $cq->where('name', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%"));
            }))
            ->when($request->filled('date_from'), fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) => $q->whereDate('created_at', '<=', $request->date_to));

        $callLogs = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('Enquiry/Index', [
            'call_logs' => $callLogs,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'per_page']),
            'can' => [
                'create' => Gate::allows('create', CallLog::class),
                'delete' => Gate::allows('delete', CallLog::class),
            ],
            'trashedCount' => CallLog::onlyTrashed()->count(),
        ]);
    }
}
