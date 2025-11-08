// resources/js/Pages/Dashboard.tsx
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import ServiceInwardCard from './dashboard/ServiceInwardCard';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface DashboardProps {
    stats: {
        total_inwards: number;
        today_received: number;
        job_created: number;
        job_not_created: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const today = format(new Date(), 'MMM dd, yyyy');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-muted-foreground">Overview on {today}</p>
                </div>

                {/* Cards Grid – ready for many more vertical cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Service Inward Card */}
                    <ServiceInwardCard stats={stats} />

                    {/* Future cards go here */}
                    {/* <AnotherCard /> */}
                    {/* <YetAnotherCard /> */}
                </div>

                {/* Placeholder for extra content */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-lg text-muted-foreground">More analytics coming soon...</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
