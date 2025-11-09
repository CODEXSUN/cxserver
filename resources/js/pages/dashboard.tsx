// resources/js/Pages/Dashboard.tsx
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import ServiceInwardCard from './dashboard/ServiceInwardCard';
import AdminJobsCard from './dashboard/AdminJobsCard';
import AdminSparesCard from './dashboard/AdminSparesCard';
import MyJobsCard from './dashboard/MyJobsCard';
import MySparesCard from './dashboard/MySparesCard';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

interface DashboardProps {
    stats: {
        total_inwards: number;
        today_received: number;
        job_created: number;
        job_not_created: number;
        total_job_cards: number;
        open_job_cards: number;
        total_assignments: number;
        open_assignments: number;
        completed_assignments: number;
        total_spare_requests: number;
        pending_spares: number;
        issued_spares: number;
        cancelled_spares: number;
        customer_bring_spares: number;
    };
    myJobs?: {
        my_job_cards: number;
        my_assignments: number;
    };
    mySpares?: {
        pending: number;
        completed: number;
    };
}

export default function Dashboard({ stats, myJobs, mySpares }: DashboardProps) {
    const { auth } = usePage().props as unknown as { auth: { user: User } };
    const user = auth.user;

    // Check if user is admin OR super-admin
    const isAdmin = ['admin', 'super-admin'].includes(user.role as string);

    const today = format(new Date(), 'MMM dd, yyyy');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-muted-foreground">Overview on {today}</p>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <ServiceInwardCard stats={stats} />

                    {isAdmin ? (
                        <>
                            <AdminJobsCard stats={stats} />
                            <AdminSparesCard stats={stats} />
                        </>
                    ) : (
                        <>
                            <AdminJobsCard stats={stats} />
                            <AdminSparesCard stats={stats} />
                            {/*{myJobs && <MyJobsCard my={myJobs} />}*/}
                            {/*{mySpares && <MySparesCard my={mySpares} />}*/}
                        </>
                    )}
                </div>

                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-lg text-muted-foreground">More analytics coming soon...</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
