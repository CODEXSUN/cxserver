<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectCategoryResource;
use App\Http\Requests\StoreProjectCategoryRequest;
use App\Http\Requests\UpdateProjectCategoryRequest;
use App\Models\ProjectCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ProjectCategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', ProjectCategory::class);

        $filters = [
            'is_active' => $request->input('filter.is_active'), // ← CORRECT
            'search' => $request->input('search'),
        ];

        $categories = ProjectCategory::withCount('projects')
            ->filter($request->only(['is_active', 'search']))
            ->paginate($request->get('per_page', 15));

        return $this->success($categories);
    }

    public function show(ProjectCategory $projectCategory)
    {
        $this->authorize('view', $projectCategory);
        $projectCategory->loadCount('projects');
        return $this->success(new ProjectCategoryResource($projectCategory));
    }

    public function store(StoreProjectCategoryRequest $request)
    {
        $this->authorize('create', ProjectCategory::class);
        $category = ProjectCategory::create($request->validated());
        return $this->success(new ProjectCategoryResource($category), 'Project Category created', 201);
    }

    public function update(UpdateProjectCategoryRequest $request, ProjectCategory $projectCategory)
    {
        $this->authorize('update', $projectCategory);

        $projectCategory->update($request->validated());

        // Reload to get fresh data
        $projectCategory->refresh();

        return $this->success(new ProjectCategoryResource($projectCategory), 'Category updated');
    }

    public function destroy(ProjectCategory $projectCategory)
    {
        $this->authorize('delete', $projectCategory);
        $projectCategory->delete();
        return $this->success(null, 'Project Category deleted');
    }

    protected function success($data, $message = 'Success', $status = 200)
    {
        $response = ['success' => true, 'message' => $message];

        if ($data instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $response['data'] = ProjectCategoryResource::collection($data->getCollection());
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
