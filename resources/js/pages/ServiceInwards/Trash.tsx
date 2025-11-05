// resources/js/Pages/ServiceInwards/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface ServiceInward {
    id: number;
    rma: string;
    material_type: string;
    contact: { name: string };
    deleted_at: string;
}

interface TrashPageProps {
    inwards: {
        data: ServiceInward[];
        // ... pagination
    };
}

export default function Trash() {
    const route = useRoute();
    const { inwards } = usePage().props as unknown as TrashPageProps;

    return (
        <Layout>
            <Head title="Service Inwards Trash" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_inwards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Trashed Service Inwards
                        </h1>
                    </div>

                    <DataTable
                        data={inwards.data}
                        pagination={inwards}
                        routeName="service_inwards.trash"
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>RMA</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Deleted At</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inwards.data.map((inward) => (
                                <TableRow key={inward.id}>
                                    <TableCell className="font-medium">
                                        {inward.rma}
                                    </TableCell>
                                    <TableCell>{inward.contact.name}</TableCell>
                                    <TableCell>
                                        {inward.material_type}
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(inward.deleted_at),
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={inward.id}
                                            restoreRoute={route(
                                                'service_inwards.restore',
                                                inward.id,
                                            )}
                                            forceDeleteRoute={route(
                                                'service_inwards.forceDelete',
                                                inward.id,
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
