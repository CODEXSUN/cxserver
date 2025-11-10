<?php

namespace App\Http\Controllers;

use App\Models\OutServiceCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OutServiceCenterController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', OutServiceCenter::class);

        $perPage = (int)$request->input('per_page', 50);
        $perPage = in_array($perPage, [10, 25, 50, 100, 200]) ? $perPage : 50;

        $query = OutServiceCenter::query()
            ->with(['jobCard', 'status', 'user']) // ← uses `user` relationship
            ->when($request->filled('search'), fn($q) => $q->where(function ($sq) use ($request) {
                $search = $request->input('search');
                $sq->where('service_name', 'like', "%{$search}%")
                    ->orWhereHas('jobCard', fn($j) => $j->where('rma_number', 'like', "%{$search}%"));
            }))
            ->latest();

        $centers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('OutServiceCenters/Index', [
            'centers'      => $centers,
            'filters'      => $request->only(['search', 'per_page']),
            'can'          => [
                'create' => Gate::allows('create', OutServiceCenter::class),
                'delete' => Gate::allows('delete', OutServiceCenter::class),
            ],
            'trashedCount' => OutServiceCenter::onlyTrashed()->count(),
        ]);
    }

    /**
     * Show the form for creating a new out-service center.
     */
    public function create()
    {
        $this->authorize('create', OutServiceCenter::class);

        return Inertia::render('OutServiceCenters/Create', [
            'users' => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created out-service center.
     */
    public function store(Request $request)
    {
        $this->authorize('create', OutServiceCenter::class);

        // DEBUG POINT 1: Log incoming request
        Log::info('OutServiceCenter@store - Request data', $request->all());

        $validated = $request->validate([
            'job_card_id'       => 'required|exists:job_cards,id',
            'service_name'      => 'required|string|max:255',
            'sent_at'           => 'required|date',
            'user_id'           => 'required|exists:users,id',           // ← REQUIRED
            'expected_back'     => 'nullable|date|after:sent_at',
            'cost'              => 'nullable|numeric|min:0',
            'service_status_id' => 'required|exists:service_statuses,id',
            'notes'             => 'nullable|string',
        ]);

        // DEBUG POINT 2: Log validated data
        Log::info('OutServiceCenter@store - Validated data', $validated);

        try {
            $center = OutServiceCenter::create($validated);

            // DEBUG POINT 3: Success
            Log::info('OutServiceCenter@store - Created', ['id' => $center->id]);

            return redirect()
                ->route('out_service_centers.index')
                ->with('success', 'Out-service center created successfully.');
        } catch (\Throwable $e) {
            // DEBUG POINT 4: Failure
            Log::error('OutServiceCenter@store - Creation failed', [
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
                'request'   => $request->all(),
            ]);

            return back()->withErrors(['general' => 'Failed to create record. Check logs for details.']);
        }
    }

    /**
     * Display the specified out-service center.
     */
    public function show(OutServiceCenter $outServiceCenter)
    {
        $this->authorize('view', $outServiceCenter);

        $outServiceCenter->load('jobCard', 'status', 'user');

        return Inertia::render('OutServiceCenters/Show', [
            'center' => $outServiceCenter,
            'can'    => [
                'edit'   => Gate::allows('update', $outServiceCenter),
                'delete' => Gate::allows('delete', $outServiceCenter),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified out-service center.
     */
    public function edit(OutServiceCenter $outServiceCenter)
    {
        $this->authorize('update', $outServiceCenter);

        $outServiceCenter->load('user');

        return Inertia::render('OutServiceCenters/Edit', [
            'center' => $outServiceCenter,
            'users'  => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified out-service center.
     */
    public function update(Request $request, OutServiceCenter $outServiceCenter)
    {
        $this->authorize('update', $outServiceCenter);

        $validated = $request->validate([
            'job_card_id'       => 'required|exists:job_cards,id',
            'service_name'      => 'required|string|max:255',
            'sent_at'           => 'required|date',
            'user_id'           => 'required|exists:users,id',
            'expected_back'     => 'nullable|date|after:sent_at',
            'cost'              => 'nullable|numeric|min:0',
            'service_status_id' => 'required|exists:service_statuses,id',
            'notes'             => 'nullable|string',
        ]);

        Log::info('OutServiceCenter@update - Updating ID ' . $outServiceCenter->id, $validated);

        $outServiceCenter->update($validated);

        return redirect()
            ->route('out_service_centers.index')
            ->with('success', 'Out-service center updated successfully.');
    }

    /**
     * Remove the specified out-service center (soft delete).
     */
    public function destroy(OutServiceCenter $outServiceCenter)
    {
        $this->authorize('delete', $outServiceCenter);

        $outServiceCenter->delete();

        return redirect()
            ->route('out_service_centers.index')
            ->with('success', 'Out-service center moved to trash.');
    }

    /**
     * Restore a soft-deleted out-service center.
     */
    public function restore($id)
    {
        $center = OutServiceCenter::withTrashed()->findOrFail($id);
        $this->authorize('restore', $center);

        $center->restore();

        return back()->with('success', 'Out-service center restored.');
    }

    /**
     * Permanently delete a trashed out-service center.
     */
    public function forceDelete($id)
    {
        $center = OutServiceCenter::withTrashed()->findOrFail($id);
        $this->authorize('delete', $center);

        $center->forceDelete();

        return redirect()
            ->route('out_service_centers.index')
            ->with('success', 'Out-service center permanently deleted.');
    }

    /**
     * Display trashed out-service centers.
     */
    public function trash()
    {
        $this->authorize('viewAny', OutServiceCenter::class);

        $centers = OutServiceCenter::onlyTrashed()
            ->with(['jobCard', 'status', 'user'])
            ->paginate(50);

        return Inertia::render('OutServiceCenters/Trash', [
            'centers' => $centers,
        ]);
    }
}
