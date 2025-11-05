// resources/js/Pages/JobCards/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface JobCard {
    id: number;
    job_no: string;
    service_inward: { rma: string };
    deleted_at: string;
}

interface Props {
    jobs: {
        data: JobCard[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function Trash() {
    const route = useRoute();
    const { jobs } = usePage().props as unknown as Props;

    return (
        <Layout>
            <Head title="Job Cards Trash" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_cards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Trashed Job Cards</h1>
                    </div>

                    <DataTable
                        data={jobs.data}
                        pagination={jobs}
                        routeName="job_cards.trash"
                        queryParams={{}}
                        emptyMessage="No trashed job cards."
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job No</TableHead>
                                <TableHead>Inward</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.data.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">{job.job_no}</TableCell>
                                    <TableCell>{job.service_inward.rma}</TableCell>
                                    <TableCell>{format(new Date(job.deleted_at), 'dd MMM yyyy HH:mm')}</TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={job.id}
                                            restoreRoute={route('job_cards.restore', job.id)}
                                            forceDeleteRoute={route('job_cards.forceDelete', job.id)}
                                            isDeleted={true}
                                            canDelete={true}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </DataTable>
                </div>
            </div>
        </Layout>
    );
}
