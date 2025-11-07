// resources/js/Pages/ServiceInwards/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Search, RotateCcw } from 'lucide-react';
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
    contact: { id: number; name: string; company: string | null; phone: string | null };
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
    filters: {
        search?: string;
        job_filter?: 'all' | 'yes' | 'no';
        type_filter?: 'all' | 'laptop' | 'desktop' | 'printer';
        page?: number;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { inwards, filters, can, trashedCount } = usePage().props as unknown as ServiceInwardsPageProps;
    const route = useRoute();

    const hasActiveFilters = !!filters.search || filters.job_filter !== 'all' || filters.type_filter !== 'all';

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        router.get(
            route('service_inwards.index'),
            {
                search: newFilters.search ?? filters.search,
                job_filter: newFilters.job_filter === 'all' ? undefined : newFilters.job_filter ?? filters.job_filter,
                type_filter: newFilters.type_filter === 'all' ? undefined : newFilters.type_filter ?? filters.type_filter,
                page: 1,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (value: string) => {
        updateFilters({ search: value || undefined });
    };

    const handleJobFilterChange = (value: 'all' | 'yes' | 'no') => {
        updateFilters({ job_filter: value });
    };

    const handleTypeFilterChange = (value: 'all' | 'laptop' | 'desktop' | 'printer') => {
        updateFilters({ type_filter: value });
    };

    const handleResetFilters = () => {
        router.get(route('service_inwards.index'), {}, { preserveState: true, replace: true });
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
                            <p className="text-muted-foreground mt-1">Track devices received for service</p>
                        </div>

                        <div className="flex gap-3">
                            {/* CREATE BUTTON */}
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

                    {/* FILTER BAR - INTUITIVE & RESPONSIVE */}
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        {/* Search Input */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by RMA, Serial, Contact, or Phone..."
                                    className="pl-10"
                                    defaultValue={filters.search || ''}
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch(e.currentTarget.value);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Filter Selects */}
                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={filters.job_filter || 'all'}
                                onValueChange={handleJobFilterChange}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Job Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Jobs</SelectItem>
                                    <SelectItem value="yes">Job Created</SelectItem>
                                    <SelectItem value="no">No Job</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.type_filter || 'all'}
                                onValueChange={handleTypeFilterChange}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Device Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="laptop">Laptop</SelectItem>
                                    <SelectItem value="desktop">Desktop</SelectItem>
                                    <SelectItem value="printer">Printer</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Reset Button - Only shown when filters are active */}
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-1"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                        </div>

                        {/* Search Button */}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                                handleSearch(input?.value || '');
                            }}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>

                    {/* Active Filters Summary (Optional Visual Feedback) */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            {filters.search && (
                                <Badge variant="secondary">
                                    Search: "{filters.search}"
                                </Badge>
                            )}
                            {filters.job_filter && filters.job_filter !== 'all' && (
                                <Badge variant="secondary">
                                    Job: {filters.job_filter === 'yes' ? 'Created' : 'Not Created'}
                                </Badge>
                            )}
                            {filters.type_filter && filters.type_filter !== 'all' && (
                                <Badge variant="secondary">
                                    Type: {filters.type_filter.charAt(0).toUpperCase() + filters.type_filter.slice(1)}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* DATA TABLE */}
                    <DataTable
                        title="All Service Inwards"
                        data={inwards.data}
                        pagination={inwards}
                        routeName="service_inwards.index"
                        queryParams={{
                            search: filters.search,
                            job_filter: filters.job_filter === 'all' ? undefined : filters.job_filter,
                            type_filter: filters.type_filter === 'all' ? undefined : filters.type_filter,
                        }}
                        emptyMessage="No service inwards found."
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>RMA</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Phone</TableHead>
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
                                        {inward.contact.phone ? (
                                            <a href={`tel:${inward.contact.phone}`} className="text-primary hover:underline">
                                                {inward.contact.phone}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
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
