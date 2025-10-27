<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\JobResource;
use App\Http\Resources\JobCollection;
use App\Models\Job;
use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use Illuminate\Http\Request;

class JobController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Job::class);

        $jobs = Job::with(['enquiry.contact', 'category'])->filter($request)->sort($request)->paginate(20);
        return $this->paginatedResponse(new JobCollection($jobs));
    }

    public function store(StoreJobRequest $request)
    {
        $this->authorize('create', Job::class);

        $job = Job::create($request->validated() + ['job_code' => Job::generateCode()]);
        activity()->on($job)->log('created');

        return $this->success(new JobResource($job), 'Job created', 201);
    }

    public function show(Job $job)
    {
        $this->authorize('view', $job);
        return $this->success(new JobResource($job->load(['tasks', 'quotations', 'invoices', 'feedback'])));
    }

    public function update(UpdateJobRequest $request, Job $job)
    {
        $this->authorize('update', $job);
        $job->update($request->validated());
        activity()->on($job)->log('updated');
        return $this->success(new JobResource($job), 'Job updated');
    }

    public function destroy(Job $job)
    {
        $this->authorize('delete', $job);
        $job->delete();
        return $this->success(null, 'Job deleted');
    }
}
