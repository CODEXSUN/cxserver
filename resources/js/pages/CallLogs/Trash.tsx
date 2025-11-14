// resources/js/Pages/CallLogs/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface CallLog {
    id: number;
    mobile: string;
    call_type: string;
    contact: { name: string };
    deleted_at: string;
}

interface TrashPageProps {
    call_logs: {
        data: CallLog[];
    };
}

export default function Trash() {
    const route = useRoute();
    const { call_logs } = usePage().props as unknown as TrashPageProps;

    return (
        <Layout>
            <Head title="Call Logs Trash" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('calls.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Trashed Call Logs
                        </h1>
                    </div>

                    <DataTable
                        data={call_logs.data}
                        pagination={call_logs}
                        routeName="calls.trash"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {call_logs.data.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">
                                        {log.mobile}
                                    </TableCell>
                                    <TableCell>{log.contact.name}</TableCell>
                                    <TableCell>
                                        {log.call_type}
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(log.deleted_at),
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={log.id}
                                            restoreRoute={route(
                                                'calls.restore',
                                                log.id,
                                            )}
                                            forceDeleteRoute={route(
                                                'calls.forceDelete',
                                                log.id,
                                            )}
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
