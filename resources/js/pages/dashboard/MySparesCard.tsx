// resources/js/components/dashboard/MySparesCard.tsx
import { Link } from '@inertiajs/react';
import { Package, CheckCircle, ArrowRight } from 'lucide-react';
import { index as job_spare_requests } from '@/routes/job_spare_requests';

interface MySparesCardProps {
    my: {
        pending: number;
        completed: number;
    };
}

export default function MySparesCard({ my }: MySparesCardProps) {
    return (
        <div className="group relative block rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            {/* Card body */}
            <div className="p-6 pb-10"> {/* ← increased bottom padding */}
                <div className="mb-5">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Package className="h-5 w-5 text-primary" />
                        My Spare Requests
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Package className="h-4 w-4 text-red-600" />
                            Pending
                        </div>
                        <div className="text-2xl font-bold text-red-600">{my.pending}</div>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            Completed
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{my.completed}</div>
                    </div>
                </div>
            </div>

            {/* Bottom-right link – above gradient */}
            <div className="absolute bottom-3 right-6">
                <Link
                    href={job_spare_requests()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    View All Requests
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* Gradient bar – full width at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
