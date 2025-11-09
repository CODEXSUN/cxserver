// resources/js/Pages/ServiceParts/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DataTable from '@/components/table/DataTable';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface Part {
    id: number;
    part_code: string;
    name: string;
    deleted_at: string;
}

interface Props {
    parts: {
        data: Part[];
        current_page: number;
        last_page: number;
    };
}

export default function Trash() {
    const { parts } = usePage().props as unknown as Props;
    const route = useRoute();

    const restore = (id: number) => router.post(route('service_parts.restore', id), {}, { preserveState: true });
    const forceDelete = (id: number) => {
        if (confirm('Permanently delete this part?')) router.delete(route('service_parts.forceDelete', id));
    };

    return (
        <Layout>
            <Head title="Trashed Parts" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_parts.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Parts</h1>
                            <p className="text-muted-foreground mt-1">Restore or permanently delete</p>
                        </div>
                    </div>

                    <Separator />

                    <DataTable data={parts.data} pagination={parts} emptyMessage="No trashed parts.">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Part Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parts.data.map(p => (
                                <TableRow key={p.id} className="opacity-60">
                                    <TableCell>{p.part_code}</TableCell>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{new Date(p.deleted_at).toLocaleString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => restore(p.id)}>
                                            <RotateCcw className="h-4 w-4 mr-1" />Restore
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => forceDelete(p.id)}>
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
