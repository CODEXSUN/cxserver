// resources/js/Pages/JobAssignments/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
    id: number;
    job_card: { job_no: string; service_inward: { rma: string; contact: { name: string } } };
    user: { name: string };
    deleted_at: string;
}

interface Props {
    assignments: {
        data: Assignment[];
        current_page: number;
        last_page: number;
    };
}

export default function Trash() {
    const { assignments } = usePage().props as unknown as Props;
    const route = useRoute();

    const handleRestore = (id: number) => {
        router.post(route('job_assignments.restore', id), {}, { preserveState: true });
    };

    const handleForceDelete = (id: number) => {
        if (confirm('Permanently delete this assignment?')) {
            router.delete(route('job_assignments.forceDelete', id));
        }
    };

    return (
        <Layout>
            <Head title="Trashed Assignments" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_assignments.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Assignments</h1>
                            <p className="text-muted-foreground mt-1">Restore or permanently delete</p>
                        </div>
                    </div>

                    <Separator />

                    <DataTable
                        data={assignments.data}
                        pagination={assignments}
                        emptyMessage="No trashed assignments."
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job</TableHead>
                                <TableHead>Technician</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.data.map((a) => (
                                <TableRow key={a.id} className="opacity-60">
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{a.job_card.job_no}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {a.job_card.service_inward.rma} – {a.job_card.service_inward.contact.name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{a.user.name}</TableCell>
                                    <TableCell>{format(new Date(a.deleted_at), 'dd MMM yyyy HH:mm')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleRestore(a.id)}>
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Restore
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleForceDelete(a.id)}>
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
