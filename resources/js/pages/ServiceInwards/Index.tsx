// resources/js/Pages/ServiceInwards/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { debounce } from 'lodash';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Search, RotateCcw, Calendar as CalendarIcon, X } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

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
        per_page: number;
    };
    filters: {
        search?: string;
        job_filter?: 'all' | 'yes' | 'no';
        type_filter?: 'all' | 'laptop' | 'desktop' | 'printer';
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { inwards, filters: serverFilters, can, trashedCount } = usePage().props as unknown as ServiceInwardsPageProps;
    const route = useRoute();

    // LOCAL FILTER STATE
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        job_filter: serverFilters.job_filter || 'all',
        type_filter: serverFilters.type_filter || 'all',
        date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
        date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
    });

    const [localPerPage, setLocalPerPage] = useState(
        serverFilters.per_page ? parseInt(serverFilters.per_page) : 100
    );

    const [isNavigating, setIsNavigating] = useState(false);

    // SYNC WITH SERVER
    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            job_filter: serverFilters.job_filter || 'all',
            type_filter: serverFilters.type_filter || 'all',
            date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
            date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
        });
        setLocalPerPage(serverFilters.per_page ? parseInt(serverFilters.per_page) : 100);
    }, [serverFilters]);

    // DEBOUNCED SEARCH
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            updateFilters({ search: value || undefined });
        }, 500),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    // UPDATE FILTERS
    const updateFilters = useCallback(
        (updates: Partial<typeof serverFilters>) => {
            setIsNavigating(true);

            const payload: any = {
                search: 'search' in updates ? updates.search : (localFilters.search || undefined),
                job_filter:
                    updates.job_filter === 'all'
                        ? undefined
                        : updates.job_filter ?? (localFilters.job_filter === 'all' ? undefined : localFilters.job_filter),
                type_filter:
                    updates.type_filter === 'all'
                        ? undefined
                        : updates.type_filter ?? (localFilters.type_filter === 'all' ? undefined : localFilters.type_filter),
                date_from: updates.date_from ?? (localFilters.date_from ? format(localFilters.date_from, 'yyyy-MM-dd') : undefined),
                date_to: updates.date_to ?? (localFilters.date_to ? format(localFilters.date_to, 'yyyy-MM-dd') : undefined),
                per_page: localPerPage,
                page: 1,
            };

            router.get(route('service_inwards.index'), payload, {
                preserveState: true,
                replace: true,
                onFinish: () => setIsNavigating(false),
            });
        },
        [route, localFilters, localPerPage]
    );

    // CLEAR FILTER
    const clearFilter = (key: keyof typeof localFilters) => {
        const updates: any = {};
        if (key === 'search') updates.search = '';
        if (key === 'job_filter') updates.job_filter = 'all';
        if (key === 'type_filter') updates.type_filter = 'all';
        if (key === 'date_from' || key === 'date_to') {
            updates.date_from = undefined;
            updates.date_to = undefined;
        }

        setLocalFilters(prev => ({
            ...prev,
            ...(key === 'search' ? { search: '' } : {}),
            ...(key === 'job_filter' ? { job_filter: 'all' } : {}),
            ...(key === 'type_filter' ? { type_filter: 'all' } : {}),
            ...(key === 'date_from' || key === 'date_to' ? { date_from: undefined, date_to: undefined } : {}),
        }));

        updateFilters(updates);
    };

    // HANDLERS
    const handleSearchChange = (value: string) => {
        setLocalFilters(prev => ({ ...prev, search: value }));
        debouncedSearch(value);
    };

    const handleJobFilterChange = (value: 'all' | 'yes' | 'no') => {
        setLocalFilters(prev => ({ ...prev, job_filter: value }));
        updateFilters({ job_filter: value });
    };

    const handleTypeFilterChange = (value: 'all' | 'laptop' | 'desktop' | 'printer') => {
        setLocalFilters(prev => ({ ...prev, type_filter: value }));
        updateFilters({ type_filter: value });
    };

    const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
        const newRange = range || { from: undefined, to: undefined };
        setLocalFilters(prev => ({
            ...prev,
            date_from: newRange.from,
            date_to: newRange.to,
        }));
        updateFilters({
            date_from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : undefined,
            date_to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : undefined,
        });
    };

    const handleResetFilters = () => {
        const empty = {
            search: '',
            job_filter: 'all' as const,
            type_filter: 'all' as const,
            date_from: undefined,
            date_to: undefined,
        };
        setLocalFilters(empty);
        setLocalPerPage(100);
        router.get(route('service_inwards.index'), {}, { preserveState: true, replace: true });
    };

    const handleSearch = () => updateFilters({ search: localFilters.search || undefined });

    // ACTIVE FILTER BADGES
    const activeFilterBadges = useMemo(() => {
        const badges: JSX.Element[] = [];

        if (localFilters.search) {
            badges.push(
                <Badge key="search" variant="secondary" className="text-xs flex items-center gap-1">
                    Search: "{localFilters.search}"
                    <button onClick={() => clearFilter('search')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            );
        }

        if (localFilters.job_filter !== 'all') {
            badges.push(
                <Badge key="job" variant="secondary" className="text-xs flex items-center gap-1">
                    Job: {localFilters.job_filter === 'yes' ? 'Created' : 'Not Created'}
                    <button onClick={() => clearFilter('job_filter')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            );
        }

        if (localFilters.type_filter !== 'all') {
            badges.push(
                <Badge key="type" variant="secondary" className="text-xs flex items-center gap-1">
                    Type: {localFilters.type_filter.charAt(0).toUpperCase() + localFilters.type_filter.slice(1)}
                    <button onClick={() => clearFilter('type_filter')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            );
        }

        if (localFilters.date_from || localFilters.date_to) {
            badges.push(
                <Badge key="date" variant="secondary" className="text-xs flex items-center gap-1">
                    Date: {localFilters.date_from ? format(localFilters.date_from, 'dd MMM') : '...'} -{' '}
                    {localFilters.date_to ? format(localFilters.date_to, 'dd MMM yyyy') : '...'}
                    <button onClick={() => clearFilter('date_from')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            );
        }

        if (badges.length === 0) {
            badges.push(
                <span key="no-filter" className="text-xs text-muted-foreground italic">
                    No active filters
                </span>
            );
        }

        return badges;
    }, [localFilters]);

    const formatDateRange = () => {
        const { date_from, date_to } = localFilters;
        if (!date_from && !date_to) return 'Pick a date range';
        if (date_from && date_to) return `${format(date_from, 'dd MMM yyyy')} - ${format(date_to, 'dd MMM yyyy')}`;
        if (date_from) return `${format(date_from, 'dd MMM yyyy')} - ...`;
        if (date_to) return `... - ${format(date_to, 'dd MMM yyyy')}`;
        return 'Pick a date range';
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
                                        <TooltipContent><p>Add a new service inward</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

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

                    {/* FILTER BAR */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex-1 min-w-[200px] max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by RMA, Serial, Contact, Phone..."
                                    className="pl-10 h-9"
                                    value={localFilters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                                    disabled={isNavigating}
                                />
                            </div>
                        </div>

                        <Select value={localFilters.job_filter} onValueChange={handleJobFilterChange} disabled={isNavigating}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="All Jobs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                <SelectItem value="yes">Job Created</SelectItem>
                                <SelectItem value="no">No Job</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.type_filter} onValueChange={handleTypeFilterChange} disabled={isNavigating}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="laptop">Laptop</SelectItem>
                                <SelectItem value="desktop">Desktop</SelectItem>
                                <SelectItem value="printer">Printer</SelectItem>
                            </SelectContent>
                        </Select>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 px-3 text-left font-normal" disabled={isNavigating}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span className="truncate max-w-[140px]">{formatDateRange()}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: localFilters.date_from, to: localFilters.date_to }}
                                    onSelect={handleDateRangeChange}
                                    numberOfMonths={2}
                                    disabled={isNavigating}
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="flex gap-1">
                            <Button size="sm" className="h-9" onClick={handleSearch} disabled={isNavigating}>
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={handleResetFilters}
                                disabled={isNavigating}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* ACTIVE FILTERS */}
                    <div className="flex flex-wrap gap-2 text-sm mt-2 p-3 bg-muted/30 rounded-md border">
                        <span className="font-medium text-foreground">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">
                            {activeFilterBadges}
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <DataTable
                        data={inwards.data}
                        pagination={inwards}
                        routeName="service_inwards.index"
                        queryParams={{
                            search: localFilters.search || undefined,
                            job_filter: localFilters.job_filter === 'all' ? undefined : localFilters.job_filter,
                            type_filter: localFilters.type_filter === 'all' ? undefined : localFilters.type_filter,
                            date_from: localFilters.date_from ? format(localFilters.date_from, 'yyyy-MM-dd') : undefined,
                            date_to: localFilters.date_to ? format(localFilters.date_to, 'yyyy-MM-dd') : undefined,
                            per_page: localPerPage,
                        }}
                        emptyMessage="No service inwards found."
                        isLoading={isNavigating}
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
                                            className={inward.job_created ? "bg-green-400 text-white" : "bg-red-500 text-white"}
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
