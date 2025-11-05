// resources/js/Pages/ServiceStatuses/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface ServiceStatus {
    id: number;
    name: string;
}

interface Props {
    statuses: ServiceStatus[];
    can: { create: boolean; delete: boolean };
}

export default function Index() {
    const { statuses, can } = usePage().props as unknown as Props;
    const route = useRoute();

    return (
        <Layout>
            <Head title="Service Statuses" />
            <div className="py-12 max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Service Statuses</h1>
                        <p className="text-muted-foreground">Manage job status labels</p>
                    </div>
                    {can.create && (
                        <Button asChild>
                            <Link href={route('service_statuses.create')}>New Status</Link>
                        </Button>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="bg-muted/50">ID</TableHead>
                                <TableHead className="bg-muted/50">Name</TableHead>
                                <TableHead className="bg-muted/50 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statuses.map((status) => (
                                <TableRow key={status.id}>
                                    <TableCell>{status.id}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{status.name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {can.delete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Delete this status?')) {
                                                        router.delete(route('service_statuses.destroy', status.id));
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Layout>
    );
}
