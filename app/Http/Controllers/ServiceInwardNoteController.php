<?php

namespace App\Http\Controllers;

use App\Models\ServiceInward;
use App\Models\ServiceInwardNote;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ServiceInwardNoteController extends Controller
{
    use AuthorizesRequests;
    public function index(ServiceInward $serviceInward)
    {
        $this->authorize('viewAny', ServiceInwardNote::class);

        $notes = $serviceInward->notes()
            ->with(['user:id,name', 'replies.user:id,name'])
            ->whereNull('parent_id')
            ->orderBy('created_at')
            ->get();

        return response()->json(['notes' => $notes]);
    }

    public function store(Request $request, ServiceInward $serviceInward)
    {
        $this->authorize('create', ServiceInwardNote::class);

        $data = $request->validate([
            'note' => 'required|string',
            'parent_id' => 'nullable|exists:service_inward_notes,id',
        ]);

        $note = $serviceInward->notes()->create([
            'user_id' => auth()->id(),
            'note' => $data['note'],
            'is_reply' => !empty($data['parent_id']),
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        $note->load('user:id,name');

        return response()->json([
            'note' => $note,
            'message' => 'Note added successfully.'
        ], 201);
    }

    public function update(Request $request, ServiceInwardNote $note)
    {
        $this->authorize('update', $note);

        $data = $request->validate([
            'note' => 'required|string',
        ]);

        $note->update($data);

        return response()->json([
            'note' => $note->load('user:id,name'),
            'message' => 'Note updated.'
        ]);
    }

    public function destroy(ServiceInwardNote $note)
    {
        $this->authorize('delete', $note);

        $note->delete();

        return response()->json(['message' => 'Note deleted.']);
    }
}
