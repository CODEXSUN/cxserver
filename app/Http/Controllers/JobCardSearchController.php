<?php
// app/Http/Controllers/JobCardSearchController.php

namespace App\Http\Controllers;

use App\Models\JobCard;
use Illuminate\Http\Request;

class JobCardSearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = $request->query('q', '');

        $jobCards = JobCard::query()
            ->with(['contact', 'serviceInward'])
            ->when($query, function ($q) use ($query) {
                $q->where('job_no', 'like', "%{$query}%")
                    ->orWhereHas('serviceInward', fn($si) => $si
                        ->where('rma', 'like', "%{$query}%")
                        ->orWhere('brand', 'like', "%{$query}%")
                        ->orWhere('model', 'like', "%{$query}%")
                    )
                    ->orWhereHas('contact', fn($c) => $c->where('name', 'like', "%{$query}%"));
            })
            ->select([
                'job_cards.id',
                'job_cards.job_no',
                'job_cards.service_inward_id',
                'job_cards.contact_id',
                'job_cards.delivered_at'
            ])
            ->with([
                'serviceInward:id,rma,material_type,brand,model',
                'contact:id,name'
            ])
            ->limit(10)
            ->get()
            ->map(function ($jc) {
                return [
                    'id' => $jc->id,
                    'job_no' => $jc->job_no,
                    'rma' => $jc->serviceInward->rma ?? '',
                    'material_type' => $jc->serviceInward->material_type ?? '',
                    'contact' => [
                        'id' => $jc->contact->id,
                        'name' => $jc->contact->name,
                    ],
                    'delivered_at' => $jc->delivered_at,
                    'service_inward' => [
                        'brand' => $jc->serviceInward->brand,
                        'model' => $jc->serviceInward->model,
                    ],
                ];
            });

        return response()->json([
            'jobcards' => $jobCards
        ]);
    }
}
