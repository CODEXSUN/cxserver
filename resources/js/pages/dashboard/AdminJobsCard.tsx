import { Link } from '@inertiajs/react';
import { Briefcase, Wrench, CheckCircle, ArrowRight } from 'lucide-react';
import { index as job_assignments } from '@/routes/job_assignments';

interface AdminJobsCardProps {
    stats: {
        total_job_cards: number;
        open_job_cards: number;
        total_assignments: number;
        open_assignments: number;
        completed_assignments: number;
    };
}

export default function AdminJobsCard({ stats }: AdminJobsCardProps) {
    return (
        <div className="group relative block rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="p-6 pb-10">
                <div className="mb-5">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Briefcase className="h-5 w-5 text-primary" />
                        All Jobs
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            Total Jobs
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.total_job_cards}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Wrench className="h-4 w-4 text-orange-600" />
                            Open Tasks
                        </div>
                        <div className="text-2xl font-bold text-orange-600">{stats.open_assignments}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            Completed
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.completed_assignments}</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-3 right-6">
                <Link href={job_assignments()} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
