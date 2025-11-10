<?php

namespace App\Http\Controllers;

use App\Models\ServiceInward;
use App\Models\ServiceInwardNote;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ServiceInwardNoteController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, ServiceInward $serviceInward)
    {
        $this->authorize('create', ServiceInwardNote::class);

        $data = $request->validate([
            'note' => 'required|string',
            'parent_id' => 'nullable|exists:service_inward_notes,id',
        ]);

        $serviceInward->notes()->create([
            'user_id' => auth()->id(),
            'note' => $data['note'],
            'is_reply' => !empty($data['parent_id']),
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return back()->with('success', 'Note added successfully.');
    }

    public function update(Request $request, ServiceInwardNote $note)
    {
        $this->authorize('update', $note);

        $data = $request->validate(['note' => 'required|string']);
        $note->update($data);

        return back()->with('success', 'Note updated.');
    }

    public function destroy(ServiceInwardNote $note)
    {
        $this->authorize('delete', $note);
        $note->delete();

        return back()->with('success', 'Note deleted.');
    }

}
