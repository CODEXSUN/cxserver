<?php
// app/Http/Controllers/OutServiceCenterController.php

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
            ->with([
                'jobCard:id,job_no,service_inward_id',
                'jobCard.serviceInward:id,rma,material_type', // ← load material_type
                'status:id,name',
                'user:id,name'
            ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->input('search');
                $q->where('service_name', 'like', "%{$search}%")
                    ->orWhere('material_name', 'like', "%{$search}%")
                    ->orWhereHas('jobCard.serviceInward', fn($j) => $j->where('rma', 'like', "%{$search}%"))
                    ->orWhereHas('jobCard', fn($j) => $j->where('job_no', 'like', "%{$search}%"));
            })
            ->latest();

        $centers = $query->paginate($perPage)->withQueryString();

        $centers->getCollection()->transform(function ($center) {
            $jobCard = $center->jobCard;
            $rma = $jobCard?->serviceInward?->rma ?? null;
            $material = $center->material_name ?? $jobCard?->serviceInward?->material_type ?? '—';

            $center->job_display = $jobCard
                ? "#{$jobCard->job_no}" . ($rma ? " (RMA: {$rma})" : '')
                : '—';

            $center->material_display = $material;
            $center->technician_name = $center->user?->name ?? '—';
            return $center;
        });

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

    public function create()
    {
        $this->authorize('create', OutServiceCenter::class);

        return Inertia::render('OutServiceCenters/Create', [
            'users' => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', OutServiceCenter::class);

        Log::info('OutServiceCenter@store - Raw Request', $request->all());

        $validated = $request->validate([
            'job_card_id'       => 'required|exists:job_cards,id',
            'service_name'      => 'required|string|max:255',
            'sent_at'           => 'required|date',
            'user_id'           => 'required|exists:users,id',
            'expected_back'     => 'nullable|date|after:sent_at',
            'cost'              => 'nullable|numeric|min:0',
            'service_status_id' => 'required|exists:service_statuses,id',
            'material_name'     => 'nullable|string', // ← REMOVED max:1000 (text field!)
            'notes'             => 'nullable|string',
        ]);

        Log::info('OutServiceCenter@store - Validated', $validated);

        try {
            $center = OutServiceCenter::create($validated);
            Log::info('OutServiceCenter@store - SUCCESS', ['id' => $center->id]);

            return redirect()
                ->route('out_service_centers.index')
                ->with('success', 'Out-service center created successfully.');
        } catch (\Throwable $e) {
            Log::error('OutServiceCenter@store - FAILED', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['general' => 'Failed to save. Check logs.']);
        }
    }

    public function show(OutServiceCenter $outServiceCenter)
    {
        $this->authorize('view', $outServiceCenter);

        $outServiceCenter->load([
            'jobCard:id,job_no,service_inward_id',
            'jobCard.serviceInward:id,rma',
            'status:id,name',
            'user:id,name'
        ]);

        return Inertia::render('OutServiceCenters/Show', [
            'center' => $outServiceCenter,
            'can'    => [
                'edit'   => Gate::allows('update', $outServiceCenter),
                'delete' => Gate::allows('delete', $outServiceCenter),
            ],
        ]);
    }

    public function edit(OutServiceCenter $outServiceCenter)
    {
        $this->authorize('update', $outServiceCenter);

        $outServiceCenter->load([
            'jobCard:id,job_no,service_inward_id,contact_id,delivered_at',
            'jobCard.serviceInward:id,rma,brand,model',
            'jobCard.contact:id,name',
            'user:id,name'
        ]);

        return Inertia::render('OutServiceCenters/Edit', [
            'center' => $outServiceCenter,
            'users'  => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

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
            'material_name'     => 'nullable|string', // ← FIX: no max on text
            'notes'             => 'nullable|string',
        ]);

        $outServiceCenter->update($validated);

        return redirect()
            ->route('out_service_centers.index')
            ->with('success', 'Out-service center updated successfully.');
    }

    public function destroy(OutServiceCenter $outServiceCenter)
    {
        $this->authorize('delete', $outServiceCenter);
        $outServiceCenter->delete();

        return redirect()
            ->route('out_service_centers.index')
            ->with('success', 'Out-service center moved to trash.');
    }

    public function restore($id)
    {
        $center = OutServiceCenter::withTrashed()->findOrFail($id);
        $this->authorize('restore', $center);
        $center->restore();

        return back()->with('success', 'Out-service center restored.');
    }

    public function forceDelete($id)
    {
        $center = OutServiceCenter::withTrashed()->findOrFail($id);
        $this->authorize('delete', $center);
        $center->forceDelete();

        return redirect()
            ->route('out_service_centers.index')
            ->with('success', 'Out-service center permanently deleted.');
    }

    public function trash()
    {
        $this->authorize('viewAny', OutServiceCenter::class);

        $centers = OutServiceCenter::onlyTrashed()
            ->with([
                'jobCard:id,job_no,service_inward_id',
                'jobCard.serviceInward:id,rma',
                'status:id,name',
                'user:id,name'
            ])
            ->paginate(50);

        return Inertia::render('OutServiceCenters/Trash', ['centers' => $centers]);
    }
}
