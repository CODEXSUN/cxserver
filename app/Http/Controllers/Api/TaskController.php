<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\TaskResource;
use App\Http\Resources\TaskCollection;
use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Http\Request;

class TaskController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Task::class);

        $tasks = Task::with(['job', 'category', 'assignments.user'])->filter($request)->sort($request)->paginate(20);
        return $this->paginatedResponse(new TaskCollection($tasks));
    }

    public function store(StoreTaskRequest $request)
    {
        $this->authorize('create', Task::class);

        $task = Task::create($request->validated() + ['task_code' => Task::generateCode()]);
        $task->createSlaTicket();
        activity()->on($task)->log('created');

        return $this->success(new TaskResource($task), 'Task created', 201);
    }

    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return $this->success(new TaskResource($task->load(['replies', 'assignments', 'slaTickets'])));
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $this->authorize('update', $task);
        $task->update($request->validated());
        activity()->on($task)->log('updated');
        return $this->success(new TaskResource($task), 'Task updated');
    }

    public function assign(Task $task, Request $request)
    {
        $this->authorize('assign tasks');

        $assignment = $task->assignments()->create([
            'user_id' => $request->user_id,
            'assigned_by' => auth()->id(),
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        $assignment->createSlaTicket();
        activity()->on($assignment)->log('assigned');

        return $this->success(new \App\Http\Resources\TaskAssignmentResource($assignment), 'Task assigned');
    }

    public function submit(Task $task, Request $request)
    {
        $assignment = $task->assignments()->where('user_id', auth()->id())->whereIn('status', ['in_progress', 'accepted'])->firstOrFail();
        $this->authorize('submit task', $assignment);

        $assignment->update([
            'status' => 'submitted',
            'user_notes' => $request->notes,
            'submitted_at' => now(),
        ]);

        activity()->on($assignment)->log('submitted');

        return $this->success(new \App\Http\Resources\TaskAssignmentResource($assignment), 'Task submitted');
    }

    public function handoff(Task $task, Request $request)
    {
        $assignment = $task->assignments()->where('user_id', auth()->id())->where('status', 'in_progress')->firstOrFail();
        $this->authorize('handoff task', $assignment);

        $assignment->handoffs()->create([
            'from_user_id' => auth()->id(),
            'to_user_id' => $request->to_user_id,
            'reason' => $request->reason,
        ]);

        $assignment->update(['status' => 'returned']);
        $newAssignment = $task->assignments()->create([
            'user_id' => $request->to_user_id,
            'assigned_by' => auth()->id(),
            'status' => 'assigned',
        ]);

        return $this->success(new \App\Http\Resources\TaskAssignmentResource($newAssignment), 'Task handed off');
    }
}
