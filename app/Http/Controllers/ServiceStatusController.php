<?php


namespace App\Http\Controllers;

use App\Models\ServiceStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ServiceStatusController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', ServiceStatus::class);

        $statuses = ServiceStatus::orderBy('name')->get();

        return Inertia::render('ServiceStatuses/Index', [
            'statuses' => $statuses,
            'can' => [
                'create' => Gate::allows('create', ServiceStatus::class),
                'delete' => Gate::allows('delete', ServiceStatus::class),
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', ServiceStatus::class);

        return Inertia::render('ServiceStatuses/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', ServiceStatus::class);

        $data = $request->validate([
            'name' => 'required|string|unique:service_statuses,name|max:255',
        ]);

        ServiceStatus::create($data);

        return redirect()->route('service_statuses.index')->with('success', 'Status created.');
    }

    public function edit(ServiceStatus $serviceStatus)
    {
        $this->authorize('update', $serviceStatus);

        return Inertia::render('ServiceStatuses/Edit', [
            'status' => $serviceStatus,
        ]);
    }

    public function update(Request $request, ServiceStatus $serviceStatus)
    {
        $this->authorize('update', $serviceStatus);

        $data = $request->validate([
            'name' => 'required|string|unique:service_statuses,name,' . $serviceStatus->id . '|max:255',
        ]);

        $serviceStatus->update($data);

        return redirect()->route('service_statuses.index')->with('success', 'Status updated.');
    }

    public function destroy(ServiceStatus $serviceStatus)
    {
        $this->authorize('delete', $serviceStatus);

        // Prevent delete if used
        if ($serviceStatus->jobCards()->exists()) {
            return back()->with('error', 'Cannot delete status in use.');
        }

        $serviceStatus->delete();

        return back()->with('success', 'Status moved to trash.');
    }
}
