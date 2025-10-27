<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactResource;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Contact;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Contact::class);

        $perPage = $request->get('per_page', 15);

        $filters = [
            'status' => $request->input('filter.status'),
            'search' => $request->input('search'),
        ];

        $contacts = Contact::withCount('enquiries')
            ->filter($filters)
            ->paginate($perPage);

        return $this->success($contacts); // ← Pass paginator
    }
    public function show(Contact $contact)
    {
        $this->authorize('view', $contact);

        $contact->loadCount('enquiries');
        $contact->load('enquiries');

        return $this->success(new ContactResource($contact));
    }

    public function store(StoreContactRequest $request)
    {
        $this->authorize('create', Contact::class);

        $contact = Contact::create($request->validated());

        return $this->success(new ContactResource($contact), 'Contact created', 201);
    }

    public function update(UpdateContactRequest $request, Contact $contact)
    {
        $this->authorize('update', $contact);

        $contact->update($request->validated());

        return $this->success(new ContactResource($contact), 'Contact updated');
    }

    public function destroy(Contact $contact)
    {
        $this->authorize('delete', $contact);

        $contact->delete();

        return $this->success(null, 'Contact deleted');
    }

    public function restore($id)
    {
        $contact = Contact::withTrashed()->findOrFail($id);
        $this->authorize('restore', $contact);

        $contact->restore();

        return $this->success(new ContactResource($contact), 'Contact restored');
    }

    protected function success($data, $message = 'Success', $status = 200)
    {
        $response = ['success' => true, 'message' => $message];

        if ($data instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $response['data'] = ContactResource::collection($data->getCollection());
            $response['meta'] = [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ];
        } else {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }
}
