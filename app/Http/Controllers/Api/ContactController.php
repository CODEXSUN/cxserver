<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ContactResource;
use App\Models\Contact;
use App\Http\Requests\StoreContactRequest;
use Illuminate\Http\Request;

class ContactController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Contact::class);

        $contacts = Contact::filter($request)->sort($request)->paginate(20);
        return $this->paginatedResponse(new ContactCollection($contacts));
    }

    public function store(StoreContactRequest $request)
    {
        $this->authorize('create', Contact::class);

        $contact = Contact::create($request->validated());
        activity()->on($contact)->log('created');

        return $this->success(new ContactResource($contact), 'Contact created', 201);
    }

    public function show(Contact $contact)
    {
        $this->authorize('view', $contact);
        return $this->success(new ContactResource($contact->load(['enquiries', 'feedback'])));
    }

    public function update(UpdateContactRequest $request, Contact $contact)
    {
        $this->authorize('update', $contact);

        $contact->update($request->validated());
        activity()->on($contact)->withProperties($request->validated())->log('updated');

        return $this->success(new ContactResource($contact), 'Contact updated');
    }

    public function destroy(Contact $contact)
    {
        $this->authorize('delete', $contact);

        $contact->delete();
        activity()->on($contact)->log('deleted');

        return $this->success(null, 'Contact deleted');
    }

    public function restore($id)
    {
        $contact = Contact::withTrashed()->findOrFail($id);
        $this->authorize('restore', $contact);

        $contact->restore();
        activity()->on($contact)->log('restored');

        return $this->success(new ContactResource($contact), 'Contact restored');
    }
}
