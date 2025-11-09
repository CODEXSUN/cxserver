<?php

namespace App\Http\Controllers;

use App\Models\JobAssignment;
use App\Models\JobSpareRequest;
use App\Models\ServiceInward;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today = Carbon::today();
        $user  = Auth::user();

// ── GLOBAL Service-Inward stats ─────────────────────────────────────
        $stats = [
            'total_inwards'     => ServiceInward::count(),
            'today_received'    => ServiceInward::whereDate('received_date', $today)->count(),
            'job_created'       => ServiceInward::where('job_created', true)->count(),
            'job_not_created'   => ServiceInward::where('job_created', false)->count(),
        ];

        // ── GLOBAL Job & Assignment stats ───────────────────────────────────
        $stats += [
            'total_job_cards'     => \App\Models\JobCard::count(),
            'open_job_cards'      => \App\Models\JobCard::whereDoesntHave('assignments', fn($q) => $q->whereNull('completed_at'))->count(),
            'total_assignments'   => JobAssignment::count(),
            'open_assignments'    => JobAssignment::whereNull('completed_at')->count(),
            'completed_assignments' => JobAssignment::whereNotNull('completed_at')->count(),
        ];

        // ── GLOBAL Spare Request stats ──────────────────────────────────────
        $stats += [
            'total_spare_requests' => JobSpareRequest::count(),
            'pending_spares'       => JobSpareRequest::where('status', 'pending')->count(),
            'issued_spares'        => JobSpareRequest::where('status', 'issued')->count(),
            'cancelled_spares'     => JobSpareRequest::where('status', 'cancelled')->count(),
            'customer_bring_spares'=> JobSpareRequest::where('status', 'customer_will_bring')->count(),
        ];

        // ── USER-ONLY JOB stats ─────────────────────────────────────────────
        $myJobs = [
            'my_job_cards'   => JobAssignment::where('user_id', $user->id)
                ->whereNull('completed_at')
                ->distinct('job_card_id')
                ->count('job_card_id'),

            'my_assignments' => JobAssignment::where('user_id', $user->id)
                ->whereNull('completed_at')
                ->count(),
        ];

        // ── USER-ONLY SPARE stats ───────────────────────────────────────────
        $mySpares = [
            'pending'   => JobSpareRequest::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),

            'completed' => JobSpareRequest::where('user_id', $user->id)
                ->where('status', 'issued')
                ->count(),
        ];

        return Inertia::render('dashboard', [
            'stats'     => $stats,
            'myJobs'    => $myJobs,
            'mySpares'  => $mySpares,
        ]);
    }
}
