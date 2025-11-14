<?php

namespace App\Http\Controllers;

use App\Models\CallLog;
use App\Models\CallLogNote;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class CallLogNoteController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, CallLog $callLog)
    {
        $this->authorize('create', CallLogNote::class);

        $data = $request->validate([
            'note' => 'required|string',
            'parent_id' => 'nullable|exists:call_log_notes,id',
        ]);

        $callLog->notes()->create([
            'user_id' => auth()->id(),
            'note' => $data['note'],
            'is_reply' => !empty($data['parent_id']),
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return back()->with('success', 'Note added successfully.');
    }

    public function update(Request $request, CallLogNote $note)
    {
        $this->authorize('update', $note);

        $data = $request->validate(['note' => 'required|string']);
        $note->update($data);

        return back()->with('success', 'Note updated.');
    }

    public function destroy(CallLogNote $note)
    {
        $this->authorize('delete', $note);
        $note->delete();

        return back()->with('success', 'Note deleted.');
    }
}
