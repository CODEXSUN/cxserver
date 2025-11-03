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

    public function index()
    {
        $this->authorize('viewAny', ContactType::class);

        $contactTypes = ContactType::withCount('contacts')
            ->latest()
            ->paginate(10);

        return Inertia::render('ContactTypes/Index', [
            'contactTypes' => $contactTypes,
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
