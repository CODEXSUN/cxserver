<?php

namespace App\Http\Controllers;

use App\Models\ReadyForDelivery;
use App\Models\JobCard;
use App\Models\ServiceStatus;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReadyForDeliveryController extends Controller
{
    use AuthorizesRequests;

    /** --------------------------------------------------------------
     *  INDEX – list with search & pagination
     *  -------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ReadyForDelivery::class);

        $perPage = (int) $request->input('per_page', 100);
        $perPage = in_array($perPage, [10, 25, 50, 100, 200]) ? $perPage : 100;

        $query = ReadyForDelivery::with([
            'jobCard.serviceInward.contact',  // RMA + contact
            'jobCard.contact',
            'user',
            'serviceStatus'
        ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;

                $q->where(function ($sq) use ($search) {
                    // 1. Search by Job No
                    $sq->whereHas('jobCard', fn($jq) => $jq->where('job_no', 'like', "%{$search}%"))

                        // 2. Search by RMA (from ServiceInward)
                        ->orWhereHas('jobCard.serviceInward', fn($iq) => $iq->where('rma', 'like', "%{$search}%"))

                        // 3. Search by Customer Name / Mobile
                        ->orWhereHas('jobCard.contact', fn($cq) => $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('mobile', 'like', "%{$search}%"))

                        // 4. Search by Engineer (User)
                        ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('date_from'), fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) => $q->whereDate('created_at', '<=', $request->date_to));

        $deliveries = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('ReadyForDeliveries/Index', [
            'deliveries' => $deliveries,
            'filters'    => $request->only(['search', 'date_from', 'date_to', 'per_page']),
            'can'        => [
                'create' => Gate::allows('create', ReadyForDelivery::class),
                'delete' => Gate::allows('delete', ReadyForDelivery::class),
            ],
            'trashedCount' => ReadyForDelivery::onlyTrashed()->count(),
        ]);
    }

    /** --------------------------------------------------------------
     *  CREATE – form
     *  -------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', ReadyForDelivery::class);

        $jobCards = JobCard::with(['serviceInward.contact', 'contact'])
//            ->whereDoesntHave('readyForDelivery')
            ->orderBy('job_no')
            ->get(['id', 'job_no', 'contact_id', 'service_inward_id']);

        $users = User::orderBy('name')->get(['id', 'name']);
        $statuses = ServiceStatus::orderBy('name')->get(['id', 'name']);

        return Inertia::render('ReadyForDeliveries/Create', [
            'jobCards'  => $jobCards,
            'users'     => $users,
            'statuses'  => $statuses,
        ]);
    }

    /** --------------------------------------------------------------
     *  STORE – validation + persist
     *  -------------------------------------------------------------- */
    public function store(Request $request)
    {
        $this->authorize('create', ReadyForDelivery::class);

        $data = $request->validate([
            'job_card_id'       => 'required|exists:job_cards,id|unique:ready_for_deliveries,job_card_id',
            'user_id'           => 'required|exists:users,id',
            'engineer_note'     => 'nullable|string',
            'future_note'       => 'nullable|string',
            'billing_details'   => 'nullable|string',
            'billing_amount'    => 'required|numeric|min:0',
            'service_status_id' => 'required|exists:service_statuses,id',
            'delivered_otp'     => 'nullable|string|max:6',
        ]);

        ReadyForDelivery::create($data);

        return redirect()->route('ready_for_deliveries.index')
            ->with('success', 'Ready-for-delivery record created.');
    }

    /** --------------------------------------------------------------
     *  SHOW – detail page
     *  -------------------------------------------------------------- */
    public function show(ReadyForDelivery $readyForDelivery)
    {
        $this->authorize('view', $readyForDelivery);

        $readyForDelivery->load([
            'jobCard.serviceInward.contact',
            'jobCard.contact',
            'user',
            'serviceStatus'
        ]);

        return Inertia::render('ReadyForDeliveries/Show', [
            'delivery' => $readyForDelivery,
            'can'      => [
                'edit'   => Gate::allows('update', $readyForDelivery),
                'delete' => Gate::allows('delete', $readyForDelivery),
            ],
        ]);
    }

    /** --------------------------------------------------------------
     *  EDIT – form
     *  -------------------------------------------------------------- */
    public function edit(ReadyForDelivery $readyForDelivery)
    {
        $this->authorize('update', $readyForDelivery);

        $readyForDelivery->load([
            'jobCard.serviceInward.contact',
            'jobCard.contact'
        ]);

        $users    = User::orderBy('name')->get(['id', 'name']);
        $statuses = ServiceStatus::orderBy('name')->get(['id', 'name']);

        return Inertia::render('ReadyForDeliveries/Edit', [
            'delivery' => $readyForDelivery,
            'users'    => $users,
            'statuses' => $statuses,
        ]);
    }

    /** --------------------------------------------------------------
     *  UPDATE – validation + persist
     *  -------------------------------------------------------------- */
    public function update(Request $request, ReadyForDelivery $readyForDelivery)
    {
        $this->authorize('update', $readyForDelivery);

        $data = $request->validate([
            'user_id'                => 'required|exists:users,id',
            'engineer_note'          => 'nullable|string',
            'future_note'            => 'nullable|string',
            'billing_details'        => 'nullable|string',
            'billing_amount'         => 'required|numeric|min:0',
            'service_status_id'      => 'required|exists:service_statuses,id',
            'delivered_otp'          => 'nullable|string|max:6',
            'delivered_confirmed_at' => 'nullable|date',
            'delivered_confirmed_by' => 'nullable|string',
        ]);

        $readyForDelivery->update($data);

        return redirect()->route('ready_for_deliveries.index')
            ->with('success', 'Ready-for-delivery record updated.');
    }

    /** --------------------------------------------------------------
     *  DESTROY – soft-delete
     *  -------------------------------------------------------------- */
    public function destroy(ReadyForDelivery $readyForDelivery)
    {
        $this->authorize('delete', $readyForDelivery);
        $readyForDelivery->delete();

        return redirect()->route('ready_for_deliveries.index')
            ->with('success', 'Ready-for-delivery moved to trash.');
    }

    /** --------------------------------------------------------------
     *  RESTORE – from trash
     *  -------------------------------------------------------------- */
    public function restore($id)
    {
        $delivery = ReadyForDelivery::withTrashed()->findOrFail($id);
        $this->authorize('restore', $delivery);
        $delivery->restore();

        return redirect()->route('ready_for_deliveries.index')
            ->with('success', 'Ready-for-delivery restored.');
    }

    /** --------------------------------------------------------------
     *  TRASH – list deleted records
     *  -------------------------------------------------------------- */
    public function trash()
    {
        $this->authorize('viewAny', ReadyForDelivery::class);

        $deliveries = ReadyForDelivery::onlyTrashed()
            ->with(['jobCard.serviceInward.contact', 'user'])
            ->paginate(25);

        return Inertia::render('ReadyForDeliveries/Trash', ['deliveries' => $deliveries]);
    }

    /** --------------------------------------------------------------
     *  FORCE DELETE – permanent removal
     *  -------------------------------------------------------------- */
    public function forceDelete($id)
    {
        $delivery = ReadyForDelivery::withTrashed()->findOrFail($id);
        $this->authorize('delete', $delivery);
        $delivery->forceDelete();

        return redirect()->route('ready_for_deliveries.index')
            ->with('success', 'Ready-for-delivery permanently deleted.');
    }
}
