<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\JobCard;
use App\Models\ServiceInward;
use App\Models\ServiceStatus;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class JobCardController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $this->authorize('viewAny', JobCard::class);

        $search = $request->input('search');

        $query = JobCard::with(['serviceInward.contact', 'status', 'contact'])
            ->when($search, fn($q) => $q->where('job_no', 'like', "%{$search}%")
                ->orWhereHas('serviceInward', fn($sq) => $sq->where('rma', 'like', "%{$search}%"))
                ->orWhereHas('contact', fn($cq) => $cq->where('name', 'like', "%{$search}%"))
            )
            ->latest();

        $jobs = $query->paginate(10)->withQueryString();

        return Inertia::render('JobCards/Index', [
            'jobs' => $jobs,
            'filters' => ['search' => $search],
            'can' => [
                'create' => Gate::allows('create', JobCard::class),
                'delete' => Gate::allows('delete', JobCard::class),
            ],
            'trashedCount' => JobCard::onlyTrashed()->count(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', JobCard::class);

        $inwards = ServiceInward::where('job_created', false)
            ->with('contact')
            ->get(['id', 'rma', 'contact_id']);

        $statuses = ServiceStatus::all();

        return Inertia::render('JobCards/Create', [
            'inwards' => $inwards,
            'statuses' => $statuses,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', JobCard::class);

        $data = $request->validate([
            'service_inward_id' => 'required|exists:service_inwards,id',
            'service_status_id' => 'required|exists:service_statuses,id',
            'diagnosis'         => 'nullable|string',
            'estimated_cost'    => 'nullable|numeric|min:0',
            'advance_paid'      => 'nullable|numeric|min:0',
            'final_status'      => 'nullable|string|max:255',
            'spares_applied'    => 'nullable|string|max:255',
        ]);

        // Auto‑generate job_no
        $nextId = JobCard::withTrashed()->max('id') + 1;
        $data['job_no'] = 'JOB-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

        // Copy contact from inward
        $inward = ServiceInward::findOrFail($data['service_inward_id']);
        $data['contact_id'] = $inward->contact_id;
        $data['received_at'] = now();

        $job = JobCard::create($data);

        // Auto‑mark inward as having a job
        $inward->update(['job_created' => true]);

        return redirect()->route('job_cards.index')->with('success', 'Job card created.');
    }

    public function show(JobCard $jobCard)
    {
        $this->authorize('view', $jobCard);

        $jobCard->load(['serviceInward.contact', 'status', 'contact', 'spares']);

        return Inertia::render('JobCards/Show', [
            'job' => $jobCard,
            'can' => [
                'edit'   => Gate::allows('update', $jobCard),
                'delete' => Gate::allows('delete', $jobCard),
            ],
        ]);
    }

    public function edit(JobCard $jobCard)
    {
        $this->authorize('update', $jobCard);

        $jobCard->load(['serviceInward.contact', 'status']);

        $statuses = ServiceStatus::all();

        return Inertia::render('JobCards/Edit', [
            'job' => $jobCard,
            'statuses' => $statuses,
        ]);
    }

    public function update(Request $request, JobCard $jobCard)
    {
        $this->authorize('update', $jobCard);

        $data = $request->validate([
            'service_status_id' => 'required|exists:service_statuses,id',
            'diagnosis'         => 'nullable|string',
            'estimated_cost'    => 'nullable|numeric|min:0',
            'advance_paid'      => 'nullable|numeric|min:0',
            'final_bill'        => 'nullable|numeric|min:0',
            'delivered_at'      => 'nullable|date',
            'final_status'      => 'nullable|string|max:255',
            'spares_applied'    => 'nullable|string|max:255',
        ]);

        $jobCard->update($data);

        return redirect()->route('job_cards.index')->with('success', 'Job card updated.');
    }

    public function destroy(JobCard $jobCard)
    {
        $this->authorize('delete', $jobCard);

        $jobCard->delete();

        return back()->with('success', 'Job card moved to trash.');
    }

    public function restore($id)
    {
        $job = JobCard::withTrashed()->findOrFail($id);
        $this->authorize('restore', $job);

        $job->restore();

        return back()->with('success', 'Job card restored.');
    }

    public function forceDelete($id)
    {
        $job = JobCard::withTrashed()->findOrFail($id);
        $this->authorize('delete', $job);

        $job->forceDelete();

        return back()->with('success', 'Job card permanently deleted.');
    }

    public function trash()
    {
        $this->authorize('viewAny', JobCard::class);

        $jobs = JobCard::onlyTrashed()
            ->with(['serviceInward.contact', 'status'])
            ->paginate(10);

        return Inertia::render('JobCards/Trash', ['jobs' => $jobs]);
    }
}
