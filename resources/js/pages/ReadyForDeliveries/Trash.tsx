// resources/js/Pages/ReadyForDeliveries/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { format } from 'date-fns';

interface Delivery {
    id: number;
    job_card: { job_no: string; service_inward: { rma: string }; contact: { name: string } };
    deleted_at: string;
}

interface TrashPageProps {
    deliveries: { data: Delivery[] };
}

export default function Trash() {
    const route = useRoute();
    const { deliveries } = usePage().props as unknown as TrashPageProps;

    return (
        <Layout>
            <Head title="Ready for Delivery - Trash" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('ready_for_deliveries.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Trashed Ready for Delivery
                        </h1>
                    </div>

                    <DataTable
                        data={deliveries.data}
                        pagination={deliveries}
                        routeName="ready_for_deliveries.trash"
                    >
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Job No</th>
                                    <th>RMA</th>
                                    <th>Customer</th>
                                    <th>Deleted At</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.data.map((d) => (
                                    <tr key={d.id}>
                                        <td>{d.job_card.job_no}</td>
                                        <td>{d.job_card.service_inward.rma}</td>
                                        <td>{d.job_card.contact.name}</td>
                                        <td>
                                            {format(
                                                new Date(d.deleted_at),
                                                'dd MMM yyyy HH:mm',
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <TableActions
                                                id={d.id}
                                                restoreRoute={route(
                                                    'ready_for_deliveries.restore',
                                                    d.id,
                                                )}
                                                forceDeleteRoute={route(
                                                    'ready_for_deliveries.forceDelete',
                                                    d.id,
                                                )}
                                                isDeleted={true}
                                                canDelete={true}
                                                editRoute={''}
                                                deleteRoute={''}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </DataTable>
                </div>
            </div>
        </Layout>
    );
}
