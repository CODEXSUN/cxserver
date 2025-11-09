<?php

namespace App\Http\Controllers;

use App\Models\ServicePart;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ServicePartController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', ServicePart::class);

        $perPage = $request->input('per_page', 50);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 50;

        $query = ServicePart::query()
            ->when($request->filled('search'), fn($q) => $q->where(function ($sq) use ($request) {
                $search = $request->search;
                $sq->where('part_code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            }))
            ->latest();

        $parts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('ServiceParts/Index', [
            'parts'        => $parts,
            'filters'      => $request->only(['search', 'per_page']),
            'can'          => [
                'create' => Gate::allows('create', ServicePart::class),
                'delete' => Gate::allows('delete', ServicePart::class),
            ],
            'trashedCount' => ServicePart::onlyTrashed()->count(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', ServicePart::class);
        return Inertia::render('ServiceParts/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', ServicePart::class);

        $data = $request->validate([
            'part_code'     => 'required|string|unique:service_parts,part_code',
            'name'          => 'required|string|max:255',
            'brand'         => 'nullable|string|max:255',
            'model'         => 'nullable|string|max:255',
            'unit_price'    => 'required|numeric|min:0',
            'current_stock' => 'required|integer|min:0',
            'remarks'       => 'nullable|string',
            'barcode'       => 'nullable|string|unique:service_parts,barcode',
        ]);

        ServicePart::create($data);

        return redirect()->route('service_parts.index')
            ->with('success', 'Part created.');
    }

    public function edit(ServicePart $servicePart)
    {
        $this->authorize('update', $servicePart);
        return Inertia::render('ServiceParts/Edit', [
            'part' => $servicePart,
        ]);
    }

    public function update(Request $request, ServicePart $servicePart)
    {
        $this->authorize('update', $servicePart);

        $data = $request->validate([
            'part_code'     => 'required|string|unique:service_parts,part_code,' . $servicePart->id,
            'name'          => 'required|string|max:255',
            'brand'         => 'nullable|string|max:255',
            'model'         => 'nullable|string|max:255',
            'unit_price'    => 'required|numeric|min:0',
            'current_stock' => 'required|integer|min:0',
            'remarks'       => 'nullable|string',
            'barcode'       => 'nullable|string|unique:service_parts,barcode,' . $servicePart->id,
        ]);

        $servicePart->update($data);

        return redirect()->route('service_parts.index')
            ->with('success', 'Part updated.');
    }

    public function destroy(ServicePart $servicePart)
    {
        $this->authorize('delete', $servicePart);
        $servicePart->delete();
        return back()->with('success', 'Part moved to trash.');
    }

    public function restore($id)
    {
        $part = ServicePart::withTrashed()->findOrFail($id);
        $this->authorize('restore', $part);
        $part->restore();
        return back()->with('success', 'Part restored.');
    }

    public function forceDelete($id)
    {
        $part = ServicePart::withTrashed()->findOrFail($id);
        $this->authorize('delete', $part);
        $part->forceDelete();
        return back()->with('success', 'Part permanently deleted.');
    }

    public function trash()
    {
        $this->authorize('viewAny', ServicePart::class);

        $parts = ServicePart::onlyTrashed()
            ->paginate(50);

        return Inertia::render('ServiceParts/Trash', ['parts' => $parts]);
    }
}
