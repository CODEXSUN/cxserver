// resources/js/Pages/ServiceInwards/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
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
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboard } from '@/routes';
import { index as service_inwards } from '@/routes/service_inwards/index';
import type { BreadcrumbItem } from '@/types';
import { format, parseISO } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';

interface ServiceInward {
    id: number;
    rma: string;
    material_type: 'laptop' | 'desktop' | 'printer';
    brand: string | null;
    model: string | null;
    serial_no: string | null;
    received_date: string | null;
    deleted_at: string | null;
    contact: {
        id: number;
        name: string;
        company: string | null;
        mobile: string | null;
    };
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Service Inward', href: service_inwards().url },
];

export default function Index() {
    const {
        inwards,
        filters: serverFilters,
        can,
        trashedCount,
    } = usePage().props as unknown as ServiceInwardsPageProps;
    const route = useRoute();

    // ──────────────────────────────────────────────────────────────
    // LOCAL STATE – filters + per-page
    // ──────────────────────────────────────────────────────────────
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        job_filter: serverFilters.job_filter || 'all',
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

    // Sync server filters → local state
    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            job_filter: serverFilters.job_filter || 'all',
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

    // Build URL payload
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            job_filter:
                localFilters.job_filter === 'all'
                    ? undefined
                    : localFilters.job_filter,
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

    // Navigate with filters
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('service_inwards.index'),
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

    // Reset all filters
    const handleReset = () => {
        router.get(
            route('service_inwards.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    // Clear single filter
    const clearFilter = useCallback(
        (
            key:
                | 'search'
                | 'job_filter'
                | 'type_filter'
                | 'date_from'
                | 'date_to'
                | 'per_page',
        ) => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
            if (key === 'job_filter') updates.job_filter = 'all';
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

        if (localFilters.job_filter !== 'all') {
            badges.push(
                <Badge
                    key="job"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Job:{' '}
                    {localFilters.job_filter === 'yes'
                        ? 'Created'
                        : 'Not Created'}
                    <button
                        onClick={() => clearFilter('job_filter')}
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

        // Per Page Badge (only if not default)
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
                    className="text-xs text-muted-foreground inline-flex items-center italic"
                >
                    No active filters
                </span>,
            );
        }

        return badges;
    }, [localFilters, clearFilter]);

    // Handle per-page change from DataTable
    const handlePerPageChange = (perPage: number) => {
        setLocalFilters((prev) => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Inwards" />

            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Service Inwards
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">
                                Track incoming devices
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
                                                        'service_inwards.nextRma',
                                                    )}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    New Inward
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Add a new service inward
                                        </TooltipContent>
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
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by RMA, Serial, Customer..."
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
                            value={localFilters.job_filter}
                            onValueChange={(v: 'all' | 'yes' | 'no') => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    job_filter: v,
                                }));
                                navigate({ job_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-48">
                                <SelectValue placeholder="All Jobs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Jobs</SelectItem>
                                <SelectItem value="yes">Job Created</SelectItem>
                                <SelectItem value="no">No Job</SelectItem>
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
                            <SelectTrigger className="h-9 w-40">
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
                        data={inwards.data}
                        pagination={inwards}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No inwards found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="text-anivers bg-muted font-semibold">
                                <TableHead>RMA</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Brand / Model</TableHead>
                                {/*<TableHead>Serial No</TableHead>*/}
                                <TableHead className="text-center">
                                    Job card?
                                </TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead>Receiver</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inwards.data.map((inward) => (
                                <TableRow
                                    key={inward.id}
                                    className={
                                        inward.deleted_at ? 'opacity-60' : ''
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {inward.deleted_at ? (
                                            <span className="text-muted-foreground">
                                                {inward.rma}
                                            </span>
                                        ) : (
                                            <Link
                                                href={route(
                                                    'service_inwards.show',
                                                    inward.id,
                                                )}
                                                className="hover:text-primary"
                                            >
                                                {inward.rma}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={route(
                                                'contacts.index',
                                                inward.contact.id,
                                            )}
                                            className="hover:text-primary hover:underline"
                                        >
                                        <div>
                                            <div className="font-medium">
                                                {inward.contact.name}
                                            </div>
                                            {inward.contact
                                                .mobile && (
                                                <div className="text-xs text-muted-foreground">
                                                    {
                                                        inward.contact.mobile
                                                    }
                                                </div>
                                            )}
                                            {inward.contact.company && (
                                                <div className="text-sm text-muted-foreground">
                                                    {inward.contact.company}
                                                </div>
                                            )}
                                        </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {inward.material_type
                                                .charAt(0)
                                                .toUpperCase() +
                                                inward.material_type.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {inward.brand || '—'} /{' '}
                                        {inward.model || '—'}
                                    </TableCell>
                                    {/*<TableCell>{inward.serial_no || '—'}</TableCell>*/}

                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                inward.job_created
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            className={
                                                inward.job_created
                                                    ? 'bg-green-400 text-white'
                                                    : 'bg-red-500 text-white'
                                            }
                                        >
                                            {inward.job_created ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        {inward.received_date
                                            ? format(
                                                  new Date(
                                                      inward.received_date,
                                                  ),
                                                  'dd MMM yyyy',
                                              )
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {inward.receiver?.name || '—'}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <TableActions
                                            id={inward.id}
                                            editRoute={route(
                                                'service_inwards.edit',
                                                inward.id,
                                            )}
                                            deleteRoute={route(
                                                'service_inwards.destroy',
                                                inward.id,
                                            )}
                                            restoreRoute={
                                                inward.deleted_at
                                                    ? route(
                                                          'service_inwards.restore',
                                                          inward.id,
                                                      )
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                inward.deleted_at
                                                    ? route(
                                                          'service_inwards.forceDelete',
                                                          inward.id,
                                                      )
                                                    : undefined
                                            }
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
        </AppLayout>
    );
}
