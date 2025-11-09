// resources/js/Pages/JobAssignments/Index.tsx
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
import {
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { index as job_assignments } from '@/routes/job_assignments/index';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

interface Assignment {
    id: number;
    job_card: {
        id: number;
        job_no: string;
        service_inward: { rma: string; contact: { name: string } };
    };
    user: { id: number; name: string };
    status: { id: number; name: string };
    assigned_at: string;
    stage: string | null;
    started_at: string | null;
    completed_at: string | null;
    time_spent_minutes: number;
    deleted_at: string | null;
}

interface Props {
    assignments: {
        data: Assignment[];
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
        technician_filter?: string;
        per_page?: string;
    };
    statuses: { id: number; name: string }[];
    technicians: { id: number; name: string }[];
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Job Assignment', href: job_assignments().url },
];

export default function Index() {
    const { assignments, filters, statuses, technicians, can, trashedCount } =
        usePage().props as unknown as Props;
    const route = useRoute();

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status_filter: filters.status_filter || 'all',
        technician_filter: filters.technician_filter || 'all',
        per_page: filters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server filters → local state
    useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            status_filter: filters.status_filter || 'all',
            technician_filter: filters.technician_filter || 'all',
            per_page: filters.per_page || '50',
        });
    }, [filters]);

    // Build URL payload
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            status_filter:
                localFilters.status_filter === 'all' ? undefined : localFilters.status_filter,
            technician_filter:
                localFilters.technician_filter === 'all'
                    ? undefined
                    : localFilters.technician_filter,
            per_page: localFilters.per_page,
        }),
        [localFilters]
    );

    // Navigate with filters
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('job_assignments.index'),
                { ...buildPayload(), ...extra },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsNavigating(false),
                }
            );
        },
        [route, buildPayload]
    );

    // Reset all filters
    const handleReset = () => {
        router.get(route('job_assignments.index'), {}, { preserveState: true, replace: true });
    };

    // Clear single filter
    const clearFilter = useCallback((
        key: 'search' | 'status_filter' | 'technician_filter' | 'per_page'
    ) => {
        const updates: Partial<typeof localFilters> = {};
        if (key === 'search') updates.search = '';
        if (key === 'status_filter') updates.status_filter = 'all';
        if (key === 'technician_filter') updates.technician_filter = 'all';
        if (key === 'per_page') updates.per_page = '50';

        setLocalFilters(prev => ({ ...prev, ...updates }));
        navigate(updates);
    }, [navigate]);

    // Active filter badges
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

        if (localFilters.technician_filter !== 'all') {
            const tech = technicians.find(t => t.id === parseInt(localFilters.technician_filter));
            badges.push(
                <Badge key="tech" variant="secondary" className="text-xs flex items-center gap-1">
                    Technician: {tech?.name || 'Unknown'}
                    <button onClick={() => clearFilter('technician_filter')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            );
        }

        // Per Page Badge (only if not default)
        if (localFilters.per_page !== '50') {
            badges.push(
                <Badge key="per_page" variant="secondary" className="text-xs flex items-center gap-1">
                    Per Page: {localFilters.per_page}
                    <button onClick={() => clearFilter('per_page')} className="ml-1 hover:bg-muted rounded-sm p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            );
        }

        if (badges.length === 0) {
            badges.push(
                <span key="none" className="text-xs text-muted-foreground inline-flex items-center italic">
                    No active filters
                </span>
            );
        }

        return badges;
    }, [localFilters, statuses, technicians, clearFilter]);

    // Handle per-page change from DataTable
    const handlePerPageChange = (perPage: number) => {
        setLocalFilters(prev => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Assignments" />

            <div className="py-6">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Job Assignments
                            </h1>
                            <p className="mt-1 text-sm text-black/30">
                                Assign technicians to jobs
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('job_assignments.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Assign Job
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('job_assignments.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* FILTER BAR – NO PER-PAGE SELECT */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Job No, RMA, Technician..."
                                className="pl-10 h-9"
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
                            <SelectTrigger className="w-48 h-9">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Technician Filter */}
                        <Select
                            value={localFilters.technician_filter}
                            onValueChange={(v) => {
                                setLocalFilters((prev) => ({ ...prev, technician_filter: v }));
                                navigate({ technician_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="w-48 h-9">
                                <SelectValue placeholder="All Technicians" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Technicians</SelectItem>
                                {technicians.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
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
                        <span className="font-medium text-foreground">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">{activeFilterBadges}</div>
                    </div>

                    {/* DATA TABLE */}
                    <DataTable
                        data={assignments.data}
                        pagination={assignments}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No assignments found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>Job</TableHead>
                                <TableHead>Technician</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Time Spent</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.data.map((a: Assignment) => (
                                <TableRow
                                    key={a.id}
                                    className={a.deleted_at ? 'opacity-60' : ''}
                                >
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{a.job_card.job_no}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {a.job_card.service_inward.rma} –{' '}
                                                {a.job_card.service_inward.contact.name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{a.user.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{a.status.name}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(a.assigned_at), 'dd MMM yyyy HH:mm')}
                                    </TableCell>

                                    <TableCell>
                                        {a.stage ? (
                                            <Badge variant="outline" className="capitalize">
                                                {a.stage}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {a.time_spent_minutes > 0
                                            ? `${a.time_spent_minutes} min`
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={a.id}
                                            editRoute={route('job_assignments.edit', a.id)}
                                            deleteRoute={route('job_assignments.destroy', a.id)}
                                            restoreRoute={
                                                a.deleted_at
                                                    ? route('job_assignments.restore', a.id)
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                a.deleted_at
                                                    ? route('job_assignments.forceDelete', a.id)
                                                    : undefined
                                            }
                                            isDeleted={!!a.deleted_at}
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
