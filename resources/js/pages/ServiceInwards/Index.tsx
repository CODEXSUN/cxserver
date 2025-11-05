// resources/js/Pages/ServiceInwards/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Search } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface ServiceInward {
    id: number;
    rma: string;
    material_type: 'laptop' | 'desktop' | 'printer';
    brand: string | null;
    model: string | null;
    serial_no: string | null;
    received_date: string | null;
    deleted_at: string | null;
    contact: { id: number; name: string; company: string | null };
    receiver: { id: number; name: string } | null;
    job_created: boolean;
}

interface ServiceInwardsPageProps {
    inwards: {
        data: ServiceInward[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string; page?: number };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { inwards, filters, can, trashedCount } = usePage().props as unknown as ServiceInwardsPageProps;
    const route = useRoute();

    const handleSearch = (value: string) => {
        router.get(
            route('service_inwards.index'),
            { search: value || undefined, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    return (
        <Layout>
            <Head title="Service Inwards" />
            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Service Inwards</h1>
                            <p className="text-muted-foreground mt-1">Track devices service received for service</p>
                        </div>

                        <div className="flex gap-3">
                            {/* CREATE BUTTON – ALWAYS SHOWN IF USER CAN CREATE */}
                            {can.create && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild>
                                                <Link href={route('service_inwards.create')}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    New Inward
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add a new service inward</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {/* TRASH BUTTON */}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('service_inwards.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* SEARCH BAR */}
                    <div className="flex gap-4 items-center max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by RMA, Serial, or Contact..."
                                className="pl-10"
                                defaultValue={filters.search || ''}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e.currentTarget.value);
                                    }
                                }}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                                handleSearch(input?.value || '');
                            }}
                        >
                            Search
                        </Button>
                    </div>

                    {/* DATA TABLE */}
                    <DataTable
                        title="All Service Inwards"
                        data={inwards.data}
                        pagination={inwards}
                        routeName="service_inwards.index"
                        queryParams={{ search: filters.search }}
                        emptyMessage="No service inwards found."
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>RMA</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Brand / Model</TableHead>
                                <TableHead>Serial No</TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead>Received By</TableHead>
                                <TableHead className="text-center">Job?</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inwards.data.map((inward) => (
                                <TableRow key={inward.id} className={inward.deleted_at ? 'opacity-60' : ''}>
                                    <TableCell className="font-medium">
                                        {inward.deleted_at ? (
                                            <span className="text-muted-foreground">{inward.rma}</span>
                                        ) : (
                                            <Link href={route('service_inwards.show', inward.id)} className="hover:text-primary">
                                                {inward.rma}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{inward.contact.name}</div>
                                            {inward.contact.company && (
                                                <div className="text-sm text-muted-foreground">{inward.contact.company}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {inward.material_type.charAt(0).toUpperCase() + inward.material_type.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {inward.brand || inward.model ? (
                                            <>
                                                {inward.brand && <span>{inward.brand}</span>}
                                                {inward.model && <span className="text-muted-foreground"> / {inward.model}</span>}
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{inward.serial_no || <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell>
                                        {inward.received_date ? format(new Date(inward.received_date), 'dd MMM yyyy') : '—'}
                                    </TableCell>
                                    <TableCell>{inward.receiver?.name || <span className="text-muted-foreground">—</span>}</TableCell>

                                    <TableCell className="text-center">
                                        <Badge
                                            variant={inward.job_created ? "default" : "destructive"}
                                            className={
                                                inward.job_created
                                                    ? "bg-green-400 text-white"
                                                    : "bg-red-500 text-white"
                                            }
                                        >
                                            {inward.job_created ? "Yes" : "No"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <TableActions
                                            id={inward.id}
                                            editRoute={route('service_inwards.edit', inward.id)}
                                            deleteRoute={route('service_inwards.destroy', inward.id)}
                                            restoreRoute={inward.deleted_at ? route('service_inwards.restore', inward.id) : undefined}
                                            forceDeleteRoute={inward.deleted_at ? route('service_inwards.forceDelete', inward.id) : undefined}
                                            isDeleted={!!inward.deleted_at}
                                            canDelete={can.delete}
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
