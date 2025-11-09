<?php

namespace App\Http\Controllers;

use App\Models\JobAssignment;
use App\Models\JobCard;
use App\Models\ServiceStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class JobAssignmentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', JobAssignment::class);

        $perPage = $request->input('per_page', 50);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 50;

        $query = JobAssignment::with(['jobCard.serviceInward.contact', 'user', 'status'])
            ->when($request->filled('search'), fn($q) => $q->where(function ($sq) use ($request) {
                $search = $request->search;
                $sq->whereHas('jobCard', fn($j) => $j->where('job_no', 'like', "%{$search}%"))
                    ->orWhereHas('jobCard.serviceInward', fn($i) => $i->where('rma', 'like', "%{$search}%"))
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            }))
            ->when($request->status_filter && $request->status_filter !== 'all', fn($q) =>
            $q->where('service_status_id', $request->status_filter)
            )
            ->when($request->technician_filter && $request->technician_filter !== 'all', fn($q) =>
            $q->where('user_id', $request->technician_filter)
            )
            ->latest('assigned_at');

        $assignments = $query->paginate($perPage)->withQueryString();

        return Inertia::render('JobAssignments/Index', [
            'assignments' => $assignments,
            'filters' => $request->only(['search', 'status_filter', 'technician_filter', 'per_page']),
            'statuses' => ServiceStatus::orderBy('name')->get(['id', 'name']),
            'technicians' => User::orderBy('name')->get(['id', 'name']), // ← ADD THIS
            'can' => [
                'create' => Gate::allows('create', JobAssignment::class),
                'delete' => Gate::allows('delete', JobAssignment::class),
            ],
            'trashedCount' => JobAssignment::onlyTrashed()->count(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', JobAssignment::class);

        $jobCards = JobCard::with('serviceInward.contact')
            ->whereDoesntHave('assignments', fn($q) => $q->whereNull('completed_at'))
            ->get(['id', 'job_no', 'service_inward_id']);

        return Inertia::render('JobAssignments/Create', [
            'jobCards' => $jobCards,
            'users' => User::orderBy('name')->get(['id', 'name']),
            'statuses' => ServiceStatus::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', JobAssignment::class);

        $data = $request->validate([
            'job_card_id' => 'required|exists:job_cards,id',
            'user_id' => 'required|exists:users,id',
            'service_status_id' => 'required|exists:service_statuses,id',
            'remarks' => 'nullable|string',
            'stage' => 'nullable|in:New Case,Repeted,Free Service,From Out Service,Retaken,Swap Engineer',
        ]);

        $data['assigned_at'] = now();

        JobAssignment::create($data);

        return redirect()->route('job_assignments.index')->with('success', 'Assignment created.');
    }

    public function edit(JobAssignment $jobAssignment)
    {
        $this->authorize('update', $jobAssignment);

        $jobAssignment->load(['jobCard.serviceInward.contact', 'user', 'status']);

        return Inertia::render('JobAssignments/Edit', [
            'assignment' => $jobAssignment,
            'users' => User::orderBy('name')->get(['id', 'name']),
            'statuses' => ServiceStatus::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, JobAssignment $jobAssignment)
    {
        $this->authorize('update', $jobAssignment);

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'service_status_id' => 'required|exists:service_statuses,id',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date|after_or_equal:started_at',
            'time_spent_minutes' => 'nullable|integer|min:0',
            'report' => 'nullable|string',
            'remarks' => 'nullable|string',
            'stage' => 'nullable|in:New Case,Repeted,Free Service,From Out Service,Retaken,Swap Engineer',
        ]);

        $jobAssignment->update($data);

        return redirect()->route('job_assignments.index')->with('success', 'Assignment updated.');
    }

    public function destroy(JobAssignment $jobAssignment)
    {
        $this->authorize('delete', $jobAssignment);
        $jobAssignment->delete();
        return back()->with('success', 'Assignment moved to trash.');
    }

    public function restore($id)
    {
        $assignment = JobAssignment::withTrashed()->findOrFail($id);
        $this->authorize('restore', $assignment);
        $assignment->restore();
        return back()->with('success', 'Assignment restored.');
    }

    public function forceDelete($id)
    {
        $assignment = JobAssignment::withTrashed()->findOrFail($id);
        $this->authorize('delete', $assignment);
        $assignment->forceDelete();
        return back()->with('success', 'Assignment permanently deleted.');
    }

    public function trash()
    {
        $this->authorize('viewAny', JobAssignment::class);

        $assignments = JobAssignment::onlyTrashed()
            ->with(['jobCard.serviceInward.contact', 'user'])
            ->paginate(50);

        return Inertia::render('JobAssignments/Trash', ['assignments' => $assignments]);
    }
}
