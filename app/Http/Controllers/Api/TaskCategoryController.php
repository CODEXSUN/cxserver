<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskCategoryResource;
use App\Http\Requests\StoreTaskCategoryRequest;
use App\Http\Requests\UpdateTaskCategoryRequest;
use App\Models\TaskCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class TaskCategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', TaskCategory::class);

        $filters = [
            'is_active' => $request->input('filter.is_active'), // ← CORRECT
            'search' => $request->input('search'),
        ];

        $categories = TaskCategory::withCount('tasks')
            ->filter($request->only(['is_active', 'search']))
            ->paginate($request->get('per_page', 15));

        return $this->success($categories);
    }

    public function show(TaskCategory $taskCategory)
    {
        $this->authorize('view', $taskCategory);
        $taskCategory->loadCount('tasks');
        return $this->success(new TaskCategoryResource($taskCategory));
    }

    public function store(StoreTaskCategoryRequest $request)
    {
        $this->authorize('create', TaskCategory::class);
        $category = TaskCategory::create($request->validated());
        return $this->success(new TaskCategoryResource($category), 'Task Category created', 201);
    }

    public function update(UpdateTaskCategoryRequest $request, TaskCategory $taskCategory)
    {
        $this->authorize('update', $taskCategory);
        $taskCategory->update($request->validated());
        return $this->success(new TaskCategoryResource($taskCategory), 'Task Category updated');
    }

    public function destroy(TaskCategory $taskCategory)
    {
        $this->authorize('delete', $taskCategory);
        $taskCategory->delete();
        return $this->success(null, 'Task Category deleted');
    }

    protected function success($data, $message = 'Success', $status = 200)
    {
        $response = ['success' => true, 'message' => $message];

        if ($data instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $response['data'] = TaskCategoryResource::collection($data->getCollection());
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
