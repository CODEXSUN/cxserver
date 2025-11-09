// resources/js/components/dashboard/MyJobsCard.tsx
import { Link } from '@inertiajs/react';
import { Briefcase, Wrench, CheckCircle, ArrowRight } from 'lucide-react';
import { index as job_assignments } from '@/routes/job_assignments';

interface MyJobsCardProps {
    my: {
        my_job_cards: number;
        my_assignments: number;
        my_finished_jobs?: number;
    };
}

export default function MyJobsCard({ my }: MyJobsCardProps) {
    const finished = my.my_finished_jobs ?? 0;

    return (
        <div className="group relative block rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            {/* Card body */}
            <div className="p-6 pb-10"> {/* ← increased bottom padding */}
                <div className="mb-5">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Briefcase className="h-5 w-5 text-primary" />
                        My Jobs
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            Assigned Jobs
                        </div>
                        <div className="text-2xl font-bold text-foreground">{my.my_job_cards}</div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Wrench className="h-4 w-4 text-orange-600" />
                            Open Tasks
                        </div>
                        <div className="text-2xl font-bold text-orange-600">{my.my_assignments}</div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            Finished Jobs
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{finished}</div>
                    </div>
                </div>
            </div>

            {/* Bottom-right link – above gradient */}
            <div className="absolute bottom-3 right-6">
                <Link
                    href={job_assignments()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    View All Assignments
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* Gradient bar – full width at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
