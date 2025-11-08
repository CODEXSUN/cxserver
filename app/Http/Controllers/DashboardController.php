<?php

namespace App\Http\Controllers;

use App\Models\ServiceInward;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today = Carbon::today();

        $stats = [
            'total_inwards'     => ServiceInward::count(),
            'today_received'    => ServiceInward::whereDate('received_date', $today)->count(),
            'job_created'       => ServiceInward::where('job_created', true)->count(),
            'job_not_created'   => ServiceInward::where('job_created', false)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
