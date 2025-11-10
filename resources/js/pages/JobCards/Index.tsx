// resources/js/Pages/JobCards/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Calendar as CalendarIcon,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';
import { index as job_cards } from '@/routes/job_cards/index';
import type { BreadcrumbItem } from '@/types';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Job Card', href: job_cards().url },
];

export default function Index() {
    const {
        jobs,
        filters: serverFilters,
        statuses,
        can,
        trashedCount,
    } = usePage().props as unknown as Props;
    const route = useRoute();

    // Local state
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        status_filter: serverFilters.status_filter || 'all',
        type_filter: serverFilters.type_filter || 'all',
        date_from: serverFilters.date_from
            ? parseISO(serverFilters.date_from)
            : undefined,
        date_to: serverFilters.date_to
            ? parseISO(serverFilters.date_to)
            : undefined,
        per_page: serverFilters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server → local
    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            status_filter: serverFilters.status_filter || 'all',
            type_filter: serverFilters.type_filter || 'all',
            date_from: serverFilters.date_from
                ? parseISO(serverFilters.date_from)
                : undefined,
            date_to: serverFilters.date_to
                ? parseISO(serverFilters.date_to)
                : undefined,
            per_page: serverFilters.per_page || '50',
        });
    }, [serverFilters]);

    // Build payload
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            status_filter:
                localFilters.status_filter === 'all'
                    ? undefined
                    : localFilters.status_filter,
            type_filter:
                localFilters.type_filter === 'all'
                    ? undefined
                    : localFilters.type_filter,
            date_from: localFilters.date_from
                ? format(localFilters.date_from, 'yyyy-MM-dd')
                : undefined,
            date_to: localFilters.date_to
                ? format(localFilters.date_to, 'yyyy-MM-dd')
                : undefined,
            per_page: localFilters.per_page,
        }),
        [localFilters],
    );

    // Navigate
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('job_cards.index'),
                { ...buildPayload(), ...extra },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsNavigating(false),
                },
            );
        },
        [route, buildPayload],
    );

    // Reset filters
    const handleReset = () => {
        router.get(
            route('job_cards.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    // Clear single filter
    const clearFilter = useCallback(
        (
            key:
                | 'search'
                | 'status_filter'
                | 'type_filter'
                | 'date_from'
                | 'date_to'
                | 'per_page',
        ) => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
            if (key === 'status_filter') updates.status_filter = 'all';
            if (key === 'type_filter') updates.type_filter = 'all';
            if (key === 'date_from' || key === 'date_to') {
                updates.date_from = undefined;
                updates.date_to = undefined;
            }
            if (key === 'per_page') updates.per_page = '50';

            setLocalFilters((prev) => ({ ...prev, ...updates }));
            navigate(updates);
        },
        [navigate],
    );

    // Active filter badges
    const activeFilterBadges = useMemo(() => {
        const badges: JSX.Element[] = [];

        if (localFilters.search) {
            badges.push(
                <Badge
                    key="search"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Search: "{localFilters.search}"
                    <button
                        onClick={() => clearFilter('search')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.status_filter !== 'all') {
            const status = statuses.find(
                (s) => s.id === parseInt(localFilters.status_filter),
            );
            badges.push(
                <Badge
                    key="status"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Status: {status?.name || 'Unknown'}
                    <button
                        onClick={() => clearFilter('status_filter')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.type_filter !== 'all') {
            badges.push(
                <Badge
                    key="type"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Type:{' '}
                    {localFilters.type_filter.charAt(0).toUpperCase() +
                        localFilters.type_filter.slice(1)}
                    <button
                        onClick={() => clearFilter('type_filter')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.date_from || localFilters.date_to) {
            badges.push(
                <Badge
                    key="date"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Date:{' '}
                    {localFilters.date_from
                        ? format(localFilters.date_from, 'dd MMM')
                        : '...'}{' '}
                    -{' '}
                    {localFilters.date_to
                        ? format(localFilters.date_to, 'dd MMM yyyy')
                        : '...'}
                    <button
                        onClick={() => clearFilter('date_from')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        // NEW: Per Page Badge
        if (localFilters.per_page !== '50') {
            badges.push(
                <Badge
                    key="per_page"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Per Page: {localFilters.per_page}
                    <button
                        onClick={() => clearFilter('per_page')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (badges.length === 0) {
            badges.push(
                <span
                    key="none"
                    className="text-xs text-muted-foreground italic"
                >
                    No active filters
                </span>,
            );
        }

        return badges;
    }, [localFilters, statuses, clearFilter]);

    // Handle per-page change from DataTable
    const handlePerPageChange = (perPage: number) => {
        setLocalFilters((prev) => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Cards" />

            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Job Cards
                            </h1>
                            <p className="mt-1 text-sm text-black/30">
                                Manage service jobs
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild>
                                                <Link
                                                    href={route(
                                                        'job_cards.create',
                                                    )}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    New Job Card
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Add a new job card
                                        </TooltipContent>
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
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by Job No, RMA, Customer..."
                                className="h-9 pl-10"
                                value={localFilters.search}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                                onKeyUp={(e) => e.key === 'Enter' && navigate()}
                                disabled={isNavigating}
                            />
                        </div>

                        <Select
                            value={localFilters.status_filter}
                            onValueChange={(v) => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    status_filter: v,
                                }));
                                navigate({ status_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-[160px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.id}
                                        value={status.id.toString()}
                                    >
                                        {status.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={localFilters.type_filter}
                            onValueChange={(
                                v: 'all' | 'laptop' | 'desktop' | 'printer',
                            ) => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    type_filter: v,
                                }));
                                navigate({ type_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-[130px]">
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
                                <Button
                                    variant="outline"
                                    className="h-9 px-3 text-left font-normal"
                                    disabled={isNavigating}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span className="max-w-[140px] truncate">
                                        {localFilters.date_from ||
                                        localFilters.date_to
                                            ? `${localFilters.date_from ? format(localFilters.date_from, 'dd MMM') : '...'} - ${localFilters.date_to ? format(localFilters.date_to, 'dd MMM yyyy') : '...'}`
                                            : 'Pick a date range'}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    selected={{
                                        from: localFilters.date_from,
                                        to: localFilters.date_to,
                                    }}
                                    onSelect={(
                                        range:
                                            | { from?: Date; to?: Date }
                                            | undefined,
                                    ) => {
                                        const newRange = range || {
                                            from: undefined,
                                            to: undefined,
                                        };
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            date_from: newRange.from,
                                            date_to: newRange.to,
                                        }));
                                        navigate({
                                            date_from: newRange.from
                                                ? format(
                                                      newRange.from,
                                                      'yyyy-MM-dd',
                                                  )
                                                : undefined,
                                            date_to: newRange.to
                                                ? format(
                                                      newRange.to,
                                                      'yyyy-MM-dd',
                                                  )
                                                : undefined,
                                        });
                                    }}
                                    numberOfMonths={2}
                                    disabled={isNavigating}
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                className="h-9"
                                onClick={() => navigate()}
                                disabled={isNavigating}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={handleReset}
                                disabled={isNavigating}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* ACTIVE FILTERS */}
                    <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-3">
                        <span className="font-medium text-foreground">
                            Active Filters:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {activeFilterBadges}
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <DataTable
                        data={jobs.data}
                        pagination={jobs}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
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
                                <TableHead className="text-center">
                                    Spares?
                                </TableHead>
                                <TableHead>Created on</TableHead>
                                <TableHead>Diagnosis by</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.data.map((job) => (
                                <TableRow
                                    key={job.id}
                                    className={
                                        job.deleted_at ? 'opacity-60' : ''
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {job.deleted_at ? (
                                            <span className="text-muted-foreground">
                                                {job.job_no}
                                            </span>
                                        ) : (
                                            <Link
                                                href={route(
                                                    'job_cards.show',
                                                    job.id,
                                                )}
                                                className="hover:text-primary"
                                            >
                                                {job.job_no}
                                            </Link>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {job.service_inward ? (
                                            job.service_inward.rma
                                        ) : (
                                            <span className="text-muted-foreground italic">
                                                Missing Inward
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {
                                                    job.service_inward.contact
                                                        .name
                                                }
                                            </div>
                                            {job.service_inward.contact
                                                .company && (
                                                <div className="text-sm text-muted-foreground">
                                                    {
                                                        job.service_inward
                                                            .contact.company
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {job.service_inward.material_type
                                                .charAt(0)
                                                .toUpperCase() +
                                                job.service_inward.material_type.slice(
                                                    1,
                                                )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {job.status.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                job.spares_applied &&
                                                job.spares_applied !== 'No'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                job.spares_applied &&
                                                job.spares_applied !== 'No'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-black'
                                            }
                                        >
                                            {job.spares_applied !== 'No'
                                                ? 'no'
                                                : 'yes'}
                                        </Badge>
                                    </TableCell>
                                    {/*<TableCell>*/}
                                    {/*    <Badge*/}
                                    {/*        variant={*/}
                                    {/*            job.final_status === 'Completed' || job.final_status === 'Delivered'*/}
                                    {/*                ? "default"*/}
                                    {/*                : job.final_status === 'Cancelled'*/}
                                    {/*                    ? "destructive"*/}
                                    {/*                    : "secondary"*/}
                                    {/*        }*/}
                                    {/*    >*/}
                                    {/*        {job.final_status || 'Pending'}*/}
                                    {/*    </Badge>*/}
                                    {/*</TableCell>*/}
                                    <TableCell>
                                        {format(
                                            new Date(job.received_at),
                                            'dd MMM yyyy',
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {job.user?.name || '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={job.id}
                                            editRoute={route(
                                                'job_cards.edit',
                                                job.id,
                                            )}
                                            deleteRoute={route(
                                                'job_cards.destroy',
                                                job.id,
                                            )}
                                            restoreRoute={
                                                job.deleted_at
                                                    ? route(
                                                          'job_cards.restore',
                                                          job.id,
                                                      )
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                job.deleted_at
                                                    ? route(
                                                          'job_cards.forceDelete',
                                                          job.id,
                                                      )
                                                    : undefined
                                            }
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
        </AppLayout>
    );
}
