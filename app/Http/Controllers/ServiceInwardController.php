<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ServiceInward;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceInwardController extends Controller
{
    use AuthorizesRequests;

    /** --------------------------------------------------------------
     *  INDEX – list with search & pagination
     *  -------------------------------------------------------------- */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ServiceInward::class);

        $search = $request->input('search');

        $query = ServiceInward::with(['contact', 'receiver'])
            ->when($search, fn($q) => $q->where(function ($q) use ($search) {
                $q->where('rma', 'like', "%{$search}%")
                    ->orWhere('serial_no', 'like', "%{$search}%")
                    ->orWhereHas('contact', fn($cq) => $cq->where('name', 'like', "%{$search}%"));
            }))
            ->latest();

        $inwards = $query->paginate(10)->withQueryString();

        return Inertia::render('ServiceInwards/Index', [
            'inwards' => $inwards,
            'filters' => ['search' => $search],
            'can' => [
                'create' => auth()->user()->hasPermissionTo('service_inward.create'),
                'delete' => auth()->user()->hasPermissionTo('service_inward.delete'),
            ],
            'trashedCount' => ServiceInward::onlyTrashed()->count(),
        ]);
    }

    /** --------------------------------------------------------------
     *  CREATE – form
     *  -------------------------------------------------------------- */
    public function create()
    {
        $this->authorize('create', ServiceInward::class);

        $contacts = Contact::active()
            ->orderBy('name')
            ->get(['id', 'name', 'company']);

        return Inertia::render('ServiceInwards/Create', [
            'contacts' => $contacts,
        ]);
    }

    /** --------------------------------------------------------------
     *  STORE – validation + persist
     *  -------------------------------------------------------------- */
    public function store(Request $request)
    {
        $this->authorize('create', ServiceInward::class);

        $data = $request->validate([
            'rma' => 'required|string|unique:service_inwards,rma',
            'contact_id' => 'required|exists:contacts,id',
            'material_type' => 'required|in:laptop,desktop,printer',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_no' => 'nullable|string|unique:service_inwards,serial_no',
            'passwords' => 'nullable|string',
            'photo_url' => 'nullable|url',
            'observation' => 'nullable|string',
            'received_by' => 'nullable|exists:users,id',
            'received_date' => 'nullable|date',
        ]);

        $data['received_by'] ??= auth()->id();

        ServiceInward::create($data);

        return redirect()->route('service_inwards.index')
            ->with('success', 'Service inward created.');
    }

    /** --------------------------------------------------------------
     *  SHOW – detail page
     *  -------------------------------------------------------------- */
    public function show(ServiceInward $serviceInward)
    {
        $this->authorize('view', $serviceInward);

        $serviceInward->load(['contact', 'receiver']);

        return Inertia::render('ServiceInwards/Show', [
            'inward' => $serviceInward,
            'can' => [
                'edit' => auth()->user()->can('update', $serviceInward),
                'delete' => auth()->user()->can('delete', $serviceInward),
            ],
        ]);
    }

    /** --------------------------------------------------------------
     *  EDIT – form
     *  -------------------------------------------------------------- */
    public function edit(ServiceInward $serviceInward)
    {
        $this->authorize('update', $serviceInward);

        $contacts = Contact::active()
            ->orderBy('name')
            ->get(['id', 'name', 'company']);

        return Inertia::render('ServiceInwards/Edit', [
            'inward' => $serviceInward,
            'contacts' => $contacts,
        ]);
    }

    /** --------------------------------------------------------------
     *  UPDATE – validation + persist
     *  -------------------------------------------------------------- */
    public function update(Request $request, ServiceInward $serviceInward)
    {
        $this->authorize('update', $serviceInward);

        $data = $request->validate([
            'rma' => 'required|string|unique:service_inwards,rma,' . $serviceInward->id,
            'contact_id' => 'required|exists:contacts,id',
            'material_type' => 'required|in:laptop,desktop,printer',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_no' => 'nullable|string|unique:service_inwards,serial_no,' . $serviceInward->id,
            'passwords' => 'nullable|string',
            'photo_url' => 'nullable|url',
            'observation' => 'nullable|string',
            'received_by' => 'nullable|exists:users,id',
            'received_date' => 'nullable|date',
        ]);

        $serviceInward->update($data);

        return redirect()->route('service_inwards.index')
            ->with('success', 'Service inward updated.');
    }

    /** --------------------------------------------------------------
     *  DESTROY – soft-delete
     *  -------------------------------------------------------------- */
    public function destroy(ServiceInward $serviceInward)
    {
        $this->authorize('delete', $serviceInward);
        $serviceInward->delete();

        return back()->with('success', 'Service inward moved to trash.');
    }

    /** --------------------------------------------------------------
     *  RESTORE – from trash
     *  -------------------------------------------------------------- */
    public function restore($id)
    {
        $inward = ServiceInward::withTrashed()->findOrFail($id);
        $this->authorize('restore', $inward);
        $inward->restore();

        return back()->with('success', 'Service inward restored.');
    }

    /** --------------------------------------------------------------
     *  TRASH – list deleted records
     *  -------------------------------------------------------------- */
    public function trash()
    {
        $this->authorize('viewAny', ServiceInward::class);

        $inwards = ServiceInward::onlyTrashed()
            ->with(['contact', 'receiver'])
            ->paginate(10);

        return Inertia::render('ServiceInwards/Trash', ['inwards' => $inwards]);
    }

    /** --------------------------------------------------------------
     *  FORCE DELETE – permanent removal
     *  -------------------------------------------------------------- */
    public function forceDelete($id)
    {
        $inward = ServiceInward::withTrashed()->findOrFail($id);
        $this->authorize('delete', $inward);
        $inward->forceDelete();

        return back()->with('success', 'Service inward permanently deleted.');
    }
}
