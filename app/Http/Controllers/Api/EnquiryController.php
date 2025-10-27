<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EnquiryResource;
use App\Http\Requests\StoreEnquiryRequest;
use App\Http\Requests\UpdateEnquiryRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Enquiry;
use App\Models\Job;
use App\Models\Project;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class EnquiryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Enquiry::class);

        $perPage = $request->get('per_page', 15);

        $filters = [
            'status' => $request->input('filter.status'),
            'search' => $request->input('search'),
        ];

        $enquiries = Enquiry::withCount('slaTickets')
            ->with('contact')
            ->filter($filters)
            ->latest()
            ->paginate($perPage);

        return $this->success($enquiries);
    }

    public function show(Enquiry $enquiry)
    {
        $this->authorize('view', $enquiry);

        $enquiry->loadCount('slaTickets');
        $enquiry->load(['contact', 'project', 'slaTickets']);

        return $this->success(new EnquiryResource($enquiry));
    }

    public function store(StoreEnquiryRequest $request)
    {
        $this->authorize('create', Enquiry::class);

        $enquiry = Enquiry::create($request->validated());
        $enquiry->createSlaTicket();

        return $this->success(new EnquiryResource($enquiry), 'Enquiry created', 201);
    }

    public function update(UpdateEnquiryRequest $request, Enquiry $enquiry)
    {
        $this->authorize('update', $enquiry);

        $enquiry->update($request->validated());

        return $this->success(new EnquiryResource($enquiry), 'Enquiry updated');
    }

    public function destroy(Enquiry $enquiry)
    {
        $this->authorize('delete', $enquiry);

        $enquiry->delete();

        return $this->success(null, 'Enquiry deleted');
    }

    public function restore($id)
    {
        $enquiry = Enquiry::withTrashed()->findOrFail($id);
        $this->authorize('restore', $enquiry);

        $enquiry->restore();

        return $this->success(new EnquiryResource($enquiry), 'Enquiry restored');
    }

    public function resolve(Enquiry $enquiry)
    {
        $this->authorize('resolve', $enquiry);

        $enquiry->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        $enquiry->slaTickets()->update([
            'status' => 'met',
            'resolved_at' => now(),
        ]);


        return $this->success(new EnquiryResource($enquiry), 'Enquiry resolved');
    }

    public function convertToProject(Enquiry $enquiry, Request $request)
    {
        $this->authorize('convertToProject', $enquiry);

        $project = Project::create([
            'enquiry_id' => $enquiry->id,
            'project_code' => Project::generateCode(),
            'title' => $request->filled('title') ? $request->title : "Project from Enquiry #{$enquiry->id}",
            'estimated_value' => $request->estimated_value ?? 0,
            'status' => 'pending',
            'tags' => $enquiry->tags,
            'is_billable' => true,
        ]);

        return $this->success(new \App\Http\Resources\ProjectResource($project), 'Project created from enquiry', 201);
    }
    /**
     * Unified success response – mirrors ContactController
     */
    protected function success($data, $message = 'Success', $status = 200)
    {
        $response = ['success' => true, 'message' => $message];

        if ($data instanceof LengthAwarePaginator) {
            $response['data'] = EnquiryResource::collection($data->getCollection());
            $response['meta'] = [
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'per_page'     => $data->perPage(),
                'total'        => $data->total(),
            ];
        } else {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }
}
