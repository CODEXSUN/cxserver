// resources/js/Pages/OutServiceCenters/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/table/DataTable';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface Center { id: number; service_name: string; deleted_at: string; }

interface Props { centers: { data: Center[]; current_page: number; last_page: number; }; }

export default function Trash() {
    const { centers } = usePage().props as unknown as Props;
    const route = useRoute();

    const restore = (id: number) => router.post(route('out_service_centers.restore', id), {}, { preserveState: true });
    const force = (id: number) => confirm('Permanently delete?') && router.delete(route('out_service_centers.forceDelete', id));

    return (
        <Layout>
            <Head title="Trashed Out Service Centers" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild><Link href={route('out_service_centers.index')}><ArrowLeft className="h-5 w-5" /></Link></Button>
                        <div><h1 className="text-3xl font-bold tracking-tight">Trashed Centers</h1></div>
                    </div>

                    <DataTable data={centers.data} pagination={centers} emptyMessage="No trashed centers.">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {centers.data.map(c => (
                                <TableRow key={c.id} className="opacity-60">
                                    <TableCell>{c.service_name}</TableCell>
                                    <TableCell>{new Date(c.deleted_at).toLocaleString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => restore(c.id)}><RotateCcw className="h-4 w-4 mr-1" />Restore</Button>
                                        <Button size="sm" variant="destructive" onClick={() => force(c.id)}>Delete Forever</Button>
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
