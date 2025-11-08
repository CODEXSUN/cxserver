// resources/js/components/dashboard/ServiceInwardCard.tsx
import { Link } from '@inertiajs/react';
import { Package, Calendar, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { index as service_inwards } from '@/routes/service_inwards';

interface ServiceInwardCardProps {
    stats: {
        total_inwards: number;
        today_received: number;
        job_created: number;
        job_not_created: number;
    };
}

export default function ServiceInwardCard({ stats }: ServiceInwardCardProps) {
    return (
        <div className="group block rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <Link href={service_inwards()} className="block p-6">
                {/* Header */}
                <div className="mb-5">
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Package className="h-5 w-5 text-primary" />
                        Service Inward Summary
                    </h3>
                </div>

                {/* Vertical Table Rows */}
                <div className="space-y-3">
                    {/* Total Inwards */}
                    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Package className="h-4 w-4" />
                            Total Inwards
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.total_inwards}</div>
                    </div>

                    {/* Today Received */}
                    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Calendar className="h-4 w-4 text-green-600" />
                            Today Received
                        </div>
                        <div className="text-2xl font-bold text-green-600">{stats.today_received}</div>
                    </div>

                    {/* Job Created */}
                    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            Job Created
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.job_created}</div>
                    </div>

                    {/* Job Not Created */}
                    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Job Not Created
                        </div>
                        <div className="text-2xl font-bold text-red-600">{stats.job_not_created}</div>
                    </div>
                </div>
            </Link>

            {/* Bottom Link Button */}
            <div className="px-6 pb-2 flex justify-end">
                <Link
                    href={service_inwards()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    View All
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* Hover Gradient Bar */}
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
