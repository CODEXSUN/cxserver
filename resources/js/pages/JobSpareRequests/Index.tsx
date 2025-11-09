// resources/js/Pages/JobSpareRequests/Index.tsx
import AppLayout from '@/layouts/app-layout';
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
import { Plus, Trash2, Search, RotateCcw, X } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { dashboard } from '@/routes';
import { index as job_spare_requests } from '@/routes/job_spare_requests/index';
import type { BreadcrumbItem } from '@/types';

interface Request {
    id: number;
    job_card: { job_no: string; service_inward: { rma: string; contact: { name: string } } };
    service_part: { part_code: string; name: string };
    requester: { name: string };
    qty_requested: number;
    qty_issued: number;
    status: string;
    requested_at: string;
    deleted_at: string | null;
}

interface Props {
    requests: {
        data: Request[];
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
        per_page?: string;
    };
    statuses: { id: string; name: string }[];
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Spare Requests', href: job_spare_requests().url },
];

export default function Index() {
    const { requests, filters, statuses, can, trashedCount } = usePage().props as unknown as Props;
    const route = useRoute();

    // ──────────────────────────────────────────────────────────────
    // LOCAL STATE
    // ──────────────────────────────────────────────────────────────
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status_filter: filters.status_filter || 'all',
        per_page: filters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server → local
    useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            status_filter: filters.status_filter || 'all',
            per_page: filters.per_page || '50',
        });
    }, [filters]);

    // ──────────────────────────────────────────────────────────────
    // PAYLOAD
    // ──────────────────────────────────────────────────────────────
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            status_filter:
                localFilters.status_filter === 'all' ? undefined : localFilters.status_filter,
            per_page: localFilters.per_page,
        }),
        [localFilters],
    );

    // ──────────────────────────────────────────────────────────────
    // NAVIGATION
    // ──────────────────────────────────────────────────────────────
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('job_spare_requests.index'),
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

    const handleReset = () =>
        router.get(route('job_spare_requests.index'), {}, { preserveState: true, replace: true });

    // ──────────────────────────────────────────────────────────────
    // CLEAR SINGLE FILTER
    // ──────────────────────────────────────────────────────────────
    const clearFilter = useCallback(
        (key: 'search' | 'status_filter' | 'per_page') => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
            if (key === 'status_filter') updates.status_filter = 'all';
            if (key === 'per_page') updates.per_page = '50';

            setLocalFilters((prev) => ({ ...prev, ...updates }));
            navigate(updates);
        },
        [navigate],
    );

    // ──────────────────────────────────────────────────────────────
    // ACTIVE BADGES
    // ──────────────────────────────────────────────────────────────
    const activeBadges = useMemo(() => {
        const badges: JSX.Element[] = [];

        if (localFilters.search) {
            badges.push(
                <Badge key="search" variant="secondary" className="flex items-center gap-1 text-xs">
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
            const status = statuses.find(s => s.id === localFilters.status_filter);
            badges.push(
                <Badge key="status" variant="secondary" className="flex items-center gap-1 text-xs">
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

        if (localFilters.per_page !== '50') {
            badges.push(
                <Badge key="per_page" variant="secondary" className="flex items-center gap-1 text-xs">
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
                <span key="none" className="text-xs italic text-muted-foreground inline-flex items-center">
                    No active filters
                </span>,
            );
        }
        return badges;
    }, [localFilters, statuses, clearFilter]);

    // ──────────────────────────────────────────────────────────────
    // PER-PAGE HANDLER
    // ──────────────────────────────────────────────────────────────
    const handlePerPage = (perPage: number) => {
        setLocalFilters((prev) => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    // ──────────────────────────────────────────────────────────────
    // STATUS BADGE VARIANT
    // ──────────────────────────────────────────────────────────────
    const getStatusVariant = (status: string) => {
        const map: Record<string, any> = {
            pending: 'secondary',
            issued: 'default',
            customer_will_bring: 'outline',
            cancelled: 'destructive',
        };
        return map[status] || 'secondary';
    };

    // ──────────────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spare Requests" />

            <div className="py-6">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Spare Requests
                            </h1>
                            <p className="mt-1 text-sm text-black/30">
                                Manage spare part requests for jobs
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('job_spare_requests.create')}>
                                        <Plus className="mr-2 h-4 w-4" />Request Spare
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('job_spare_requests.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* FILTER BAR */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative min-w-[240px] flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search job / part / technician"
                                className="h-9 pl-10"
                                value={localFilters.search}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
                                }
                                onKeyUp={(e) => e.key === 'Enter' && navigate()}
                                disabled={isNavigating}
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={localFilters.status_filter}
                            onValueChange={(v) => {
                                setLocalFilters((prev) => ({ ...prev, status_filter: v }));
                                navigate({ status_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-[160px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statuses.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Action Buttons */}
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
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border">
                        <span className="font-medium">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">{activeBadges}</div>
                    </div>

                    {/* TABLE */}
                    <DataTable
                        data={requests.data}
                        pagination={requests}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPage}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No spare requests found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>Job</TableHead>
                                <TableHead>Part</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Requested At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.map((r) => (
                                <TableRow
                                    key={r.id}
                                    className={r.deleted_at ? 'opacity-60' : ''}
                                >
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{r.job_card.job_no}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {r.job_card.service_inward.rma} – {r.job_card.service_inward.contact.name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{r.service_part.part_code}</div>
                                            <div className="text-sm text-muted-foreground">{r.service_part.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{r.requester.name}</TableCell>
                                    <TableCell className="text-center">
                                        {r.qty_requested} {r.qty_issued > 0 && `/ ${r.qty_issued}`}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(r.status)}>
                                            {r.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(r.requested_at), 'dd MMM yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={r.id}
                                            editRoute={route('job_spare_requests.edit', r.id)}
                                            deleteRoute={route('job_spare_requests.destroy', r.id)}
                                            restoreRoute={
                                                r.deleted_at
                                                    ? route('job_spare_requests.restore', r.id)
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                r.deleted_at
                                                    ? route('job_spare_requests.forceDelete', r.id)
                                                    : undefined
                                            }
                                            isDeleted={!!r.deleted_at}
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
