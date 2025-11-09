// resources/js/Pages/JobSpareRequests/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DataTable from '@/components/table/DataTable';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface Request {
    id: number;
    job_card: { job_no: string };
    service_part: { part_code: string };
    deleted_at: string;
}

interface Props {
    requests: {
        data: Request[];
        current_page: number;
        last_page: number;
    };
}

export default function Trash() {
    const { requests } = usePage().props as unknown as Props;
    const route = useRoute();

    const restore = (id: number) => router.post(route('job_spare_requests.restore', id), {}, { preserveState: true });
    const forceDelete = (id: number) => confirm('Permanently delete?') && router.delete(route('job_spare_requests.forceDelete', id));

    return (
        <Layout>
            <Head title="Trashed Spare Requests" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_spare_requests.index')}><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Requests</h1>
                            <p className="text-muted-foreground mt-1">Restore or delete forever</p>
                        </div>
                    </div>
                    <Separator />
                    <DataTable data={requests.data} pagination={requests} emptyMessage="No trashed requests.">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job</TableHead>
                                <TableHead>Part</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.map(r => (
                                <TableRow key={r.id} className="opacity-60">
                                    <TableCell>{r.job_card.job_no}</TableCell>
                                    <TableCell>{r.service_part.part_code}</TableCell>
                                    <TableCell>{format(new Date(r.deleted_at), 'dd MMM yyyy HH:mm')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => restore(r.id)}>
                                            <RotateCcw className="h-4 w-4 mr-1" />Restore
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => forceDelete(r.id)}>
                                            Delete Forever
                                        </Button>
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
