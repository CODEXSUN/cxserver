<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\EnquiryResource;
use App\Http\Resources\EnquiryCollection;
use App\Models\Enquiry;
use App\Http\Requests\StoreEnquiryRequest;
use App\Http\Requests\UpdateEnquiryRequest;
use App\Models\Job;
use Illuminate\Http\Request;

class EnquiryController2 extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Enquiry::class);

        $enquiries = Enquiry::with(['contact'])->filter($request)->sort($request)->paginate(20);
        return $this->paginatedResponse(new EnquiryCollection($enquiries));
    }

    public function store(StoreEnquiryRequest $request)
    {
        $this->authorize('create', Enquiry::class);

        $enquiry = Enquiry::create($request->validated());
        $enquiry->createSlaTicket(); // Auto SLA
        activity()->on($enquiry)->log('created');

        return $this->success(new EnquiryResource($enquiry), 'Enquiry created', 201);
    }

    public function show(Enquiry $enquiry)
    {
        $this->authorize('view', $enquiry);
        return $this->success(new EnquiryResource($enquiry->load(['contact', 'job', 'slaTickets'])));
    }

    public function update(UpdateEnquiryRequest $request, Enquiry $enquiry)
    {
        $this->authorize('update', $enquiry);

        $enquiry->update($request->validated());
        activity()->on($enquiry)->log('updated');

        return $this->success(new EnquiryResource($enquiry), 'Enquiry updated');
    }

    public function resolve(Enquiry $enquiry)
    {
        $this->authorize('resolve enquiry', $enquiry);

        $enquiry->update(['status' => 'resolved', 'resolved_at' => now()]);
        $enquiry->slaTickets()->update(['status' => 'met', 'resolved_at' => now()]);
        activity()->on($enquiry)->log('resolved');

        return $this->success(new EnquiryResource($enquiry), 'Enquiry resolved');
    }

    public function convertToJob(Enquiry $enquiry, Request $request)
    {
        $this->authorize('convert enquiry to job', $enquiry);

        $job = Job::create([
            'enquiry_id' => $enquiry->id,
            'job_code' => Job::generateCode(),
            'title' => $request->title ?? "Job from Enquiry #{$enquiry->id}",
            'estimated_value' => $request->estimated_value ?? 0,
            'status' => 'pending',
            'tags' => $enquiry->tags,
        ]);

        activity()->on($job)->log('created from enquiry');

        return $this->success(new \App\Http\Resources\JobResource($job), 'Job created from enquiry', 201);
    }

    public function destroy(Enquiry $enquiry)
    {
        $this->authorize('delete', $enquiry);
        $enquiry->delete();
        return $this->success(null, 'Enquiry deleted');
    }
}
