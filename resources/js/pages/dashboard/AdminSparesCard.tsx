import { Link } from '@inertiajs/react';
import { Package, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { index as job_spare_requests } from '@/routes/job_spare_requests';

interface AdminSparesCardProps {
    stats: {
        total_spare_requests: number;
        pending_spares: number;
        issued_spares: number;
        cancelled_spares: number;
        customer_bring_spares: number;
    };
}

export default function AdminSparesCard({ stats }: AdminSparesCardProps) {
    return (
        <div className="group relative block rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="p-6 pb-10">
                <div className="mb-5">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Package className="h-5 w-5 text-primary" />
                        All Spare Requests
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Package className="h-4 w-4 text-red-600" />
                            Pending
                        </div>
                        <div className="text-2xl font-bold text-red-600">{stats.pending_spares}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            Issued
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.issued_spares}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <XCircle className="h-4 w-4 text-gray-600" />
                            Cancelled
                        </div>
                        <div className="text-2xl font-bold text-gray-600">{stats.cancelled_spares}</div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-3 right-6">
                <Link href={job_spare_requests()} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
