// resources/js/Pages/JobCards/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Trash2, Search, RotateCcw, Calendar as CalendarIcon, X } from 'lucide-react';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

interface JobCard {
    id: number;
    job_no: string;
    final_status: string | null;
    spares_applied: string | null;
    received_at: string;
    deleted_at: string | null;
    service_inward: {
        rma: string;
        material_type: 'laptop' | 'desktop' | 'printer';
        contact: { name: string; company?: string };
    };
    status: { id: number; name: string };
}

interface ServiceStatus {
    id: number;
    name: string;
}

interface Props {
    jobs: {
        data: JobCard[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        status_filter?: string;
        type_filter?: 'all' | 'laptop' | 'desktop' | 'printer';
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    statuses: ServiceStatus[];
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { jobs, filters: serverFilters, statuses, can, trashedCount } =
        usePage().props as unknown as Props;
    const route = useRoute();

    // Local state
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        status_filter: serverFilters.status_filter || 'all',
        type_filter: serverFilters.type_filter || 'all',
        date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
        date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
    });

    const [localPerPage, setLocalPerPage] = useState(
        serverFilters.per_page ? parseInt(serverFilters.per_page) : 100
    );

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server → local
    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            status_filter: serverFilters.status_filter || 'all',
            type_filter: serverFilters.type_filter || 'all',
            date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
            date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
        });
        setLocalPerPage(serverFilters.per_page ? parseInt(serverFilters.per_page) : 100);
    }, [serverFilters]);

    // Build payload
    const buildPayload = useCallback(
        (extra: Record<string, any> = {}) => ({
            search: localFilters.search || undefined,
            status_filter: localFilters.status_filter === 'all' ? undefined : localFilters.status_filter,
            type_filter: localFilters.type_filter === 'all' ? undefined : localFilters.type_filter,
            date_from: localFilters.date_from ? format(localFilters.date_from, 'yyyy-MM-dd') : undefined,
            date_to: localFilters.date_to ? format(localFilters.date_to, 'yyyy-MM-dd') : undefined,
            per_page: localPerPage,
            ...extra,
        }),
        [localFilters, localPerPage]
    );

    // Navigate
    const navigate = useCallback(
        (extra: Record<string, any> = {}) => {
            setIsNavigating(true);
            router.get(
                route('job_cards.index'),
                { ...buildPayload(extra), page: extra.page ?? 1 },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsNavigating(false),
                }
            );
        },
        [route, buildPayload]
    );

    // Handlers
    const handleSearchChange = (value: string) => {
        setLocalFilters(prev => ({ ...prev, search: value }));
    };

    const handleSearch = () => navigate({ search: localFilters.search });

    const handleStatusFilterChange = (value: string) => {
        setLocalFilters(prev => ({ ...prev, status_filter: value }));
        navigate({ status_filter: value });
    };

    const handleTypeFilterChange = (value: 'all' | 'laptop' | 'desktop' | 'printer') => {
        setLocalFilters(prev => ({ ...prev, type_filter: value }));
        navigate({ type_filter: value });
    };

    const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
        const newRange = range || { from: undefined, to: undefined };
        setLocalFilters(prev => ({
            ...prev,
            date_from: newRange.from,
            date_to: newRange.to,
        }));
        navigate({
            date_from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : undefined,
            date_to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : undefined,
        });
    };

    const clearFilter = (key: keyof typeof localFilters) => {
        const updates: Partial<typeof localFilters> = {};
        if (key === 'search') updates.search = '';
        if (key === 'status_filter') updates.status_filter = 'all';
        if (key === 'type_filter') updates.type_filter = 'all';
        if (key === 'date_from' || key === 'date_to') {
            updates.date_from = undefined;
            updates.date_to = undefined;
        }

        setLocalFilters(prev => ({ ...prev, ...updates }));
        navigate(updates);
    };

    const handleResetFilters = () => {
        const empty = {
            search: '',
            status_filter: 'all',
            type_filter: 'all',
            date_from: undefined,
            date_to: undefined,
        };
        setLocalFilters(empty);
        setLocalPerPage(100);
        router.get(route('job_cards.index'), {}, { preserveState: true, replace: true });
    };

    const handlePageChange = useCallback((page: number) => navigate({ page }), [navigate]);
    const handlePerPageChange = useCallback((perPage: number) => {
        setLocalPerPage(perPage);
        navigate({ per_page: perPage, page: 1 });
    }, [navigate]);

    // Active badges
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

        if (localFilters.status_filter !== 'all') {
            const status = statuses.find(s => s.id === parseInt(localFilters.status_filter));
            badges.push(
                <Badge key="status" variant="secondary" className="text-xs flex items-center gap-1">
                    Status: {status?.name || 'Unknown'}
                    <button onClick={() => clearFilter('status_filter')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
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
            badges.push(<span key="no-filter" className="text-xs text-muted-foreground italic">No active filters</span>);
        }

        return badges;
    }, [localFilters, statuses]);

    const formatDateRange = () => {
        const { date_from, date_to } = localFilters;
        if (!date_from && !date_to) return 'Pick a date range';
        if (date_from && date_to)
            return `${format(date_from, 'dd MMM yyyy')} - ${format(date_to, 'dd MMM yyyy')}`;
        if (date_from) return `${format(date_from, 'dd MMM yyyy')} - ...`;
        if (date_to) return `... - ${format(date_to, 'dd MMM yyyy')}`;
        return 'Pick a date range';
    };

    return (
        <Layout>
            <Head title="Job Cards" />
            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Job Cards</h1>
                            <p className="text-muted-foreground mt-1">Manage service jobs</p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild>
                                                <Link href={route('job_cards.create')}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    New Job Card
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Add a new job card</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('job_cards.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* FILTER BAR */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[200px] max-w-md relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by Job No, RMA, Customer..."
                                className="pl-10 h-9"
                                value={localFilters.search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                                disabled={isNavigating}
                            />
                        </div>

                        <Select value={localFilters.status_filter} onValueChange={handleStatusFilterChange} disabled={isNavigating}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statuses.map(status => (
                                    <SelectItem key={status.id} value={status.id.toString()}>
                                        {status.name}
                                    </SelectItem>
                                ))}
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
                            <Button variant="outline" size="sm" className="h-9" onClick={handleResetFilters} disabled={isNavigating}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* ACTIVE FILTERS */}
                    <div className="flex flex-wrap gap-2 text-sm mt-2 p-3 bg-muted/30 rounded-md border">
                        <span className="font-medium text-foreground">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">{activeFilterBadges}</div>
                    </div>

                    {/* DATA TABLE */}
                    <DataTable
                        data={jobs.data}
                        pagination={jobs}
                        perPage={localPerPage}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={handlePageChange}
                        emptyMessage="No job cards found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>Job No</TableHead>
                                <TableHead>Inward</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Spares?</TableHead>
                                <TableHead>Final Status</TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.data.map((job) => (
                                <TableRow key={job.id} className={job.deleted_at ? 'opacity-60' : ''}>
                                    <TableCell className="font-medium">
                                        {job.deleted_at ? (
                                            <span className="text-muted-foreground">{job.job_no}</span>
                                        ) : (
                                            <Link href={route('job_cards.show', job.id)} className="hover:text-primary">
                                                {job.job_no}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>{job.service_inward.rma}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{job.service_inward.contact.name}</div>
                                            {job.service_inward.contact.company && (
                                                <div className="text-sm text-muted-foreground">
                                                    {job.service_inward.contact.company}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {job.service_inward.material_type.charAt(0).toUpperCase() +
                                                job.service_inward.material_type.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{job.status.name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={job.spares_applied && job.spares_applied !== 'No' ? 'default' : 'secondary'}
                                            className={job.spares_applied && job.spares_applied !== 'No' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                                        >
                                            {job.spares_applied || 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                job.final_status === 'Completed' || job.final_status === 'Delivered'
                                                    ? 'default'
                                                    : job.final_status === 'Cancelled'
                                                        ? 'destructive'
                                                        : 'secondary'
                                            }
                                        >
                                            {job.final_status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(job.received_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={job.id}
                                            editRoute={route('job_cards.edit', job.id)}
                                            deleteRoute={route('job_cards.destroy', job.id)}
                                            restoreRoute={job.deleted_at ? route('job_cards.restore', job.id) : undefined}
                                            forceDeleteRoute={job.deleted_at ? route('job_cards.forceDelete', job.id) : undefined}
                                            isDeleted={!!job.deleted_at}
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
