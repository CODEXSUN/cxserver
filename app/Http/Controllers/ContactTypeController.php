<?php

namespace App\Http\Controllers;

use App\Models\ContactType;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContactTypeController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', ContactType::class);

        $perPage = $request->input('per_page', 10);
        $page    = $request->input('page', 1);

        $query = ContactType::withCount('contacts')
            ->when($request->search, fn($q,$s)=> $q->where('name','like',"%{$s}%")
                ->orWhere('description','like',"%{$s}%"))
            ->when($request->sort_by, fn($q,$col)=> $q->orderBy(
                $col,
                $request->sort_direction === 'desc' ? 'desc' : 'asc'
            ))
            ->latest();

        $contactTypes = $query->paginate($perPage)->withQueryString();

        return Inertia::render('ContactTypes/Index', [
            'contactTypes' => $contactTypes,
            'filters' => $request->only(['search', 'page', 'per_page', 'sort_by', 'sort_direction']),
            'can' => [
                'create' => auth()->user()->hasPermissionTo('contact-type.create'),
                'delete' => auth()->user()->hasPermissionTo('contact-type.delete'),
            ],
            'trashedCount' => ContactType::onlyTrashed()->count(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', ContactType::class);
        return Inertia::render('ContactTypes/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', ContactType::class);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:contact_types,name',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $data['is_active'] = $data['is_active'] ?? true;

        ContactType::create($data);

        return redirect()->route('contact-types.index')->with('success', 'Contact type created.');
    }

    public function edit(ContactType $contactType)
    {
        $this->authorize('update', $contactType);
        return Inertia::render('ContactTypes/Edit', ['contactType' => $contactType]);
    }

    public function update(Request $request, ContactType $contactType)
    {
        $this->authorize('update', $contactType);

        $data = $request->validate([
            'name' => 'required|string|max:255|unique:contact_types,name,' . $contactType->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $contactType->update($data);

        return redirect()->route('contact-types.index')->with('success', 'Contact type updated.');
    }

    public function destroy(ContactType $contactType)
    {
        $this->authorize('delete', $contactType);
        $contactType->delete();
        return back()->with('success', 'Contact type moved to trash.');
    }

    public function restore($id)
    {
        $contactType = ContactType::withTrashed()->findOrFail($id);
        $this->authorize('restore', $contactType);
        $contactType->restore();
        return back()->with('success', 'Contact type restored.');
    }

    public function trash()
    {
        $this->authorize('viewAny', ContactType::class);
        $contactTypes = ContactType::onlyTrashed()->paginate(10);
        return Inertia::render('ContactTypes/Trash', ['contactTypes' => $contactTypes]);
    }

    public function forceDelete($id)
    {
        $contactType = ContactType::withTrashed()->findOrFail($id);
        $this->authorize('delete', $contactType);
        $contactType->forceDelete();
        return back()->with('success', 'Contact type permanently deleted.');
    }
}
