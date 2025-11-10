// resources/js/Pages/OutServiceCenters/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, RotateCcw, X } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Center {
    id: number;
    service_name: string;
    job_card: { rma_number: string };
    sent_at: string;
    cost: number | null;
    deleted_at: string | null;
    delivered_by: number | null;
    delivered_by_name?: string; // ← From accessor or transform
}

interface Props {
    centers: {
        data: Center[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: { search?: string; per_page?: string };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { centers, filters, can, trashedCount } = usePage().props as unknown as Props;
    const route = useRoute();

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        per_page: filters.per_page || '50',
    });
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            per_page: filters.per_page || '50',
        });
    }, [filters]);

    const buildPayload = useCallback(() => ({
        search: localFilters.search || undefined,
        per_page: localFilters.per_page,
    }), [localFilters]);

    const navigate = useCallback((extra = {}) => {
        setIsNavigating(true);
        router.get(route('out_service_centers.index'), { ...buildPayload(), ...extra }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsNavigating(false),
        });
    }, [route, buildPayload]);

    const handleReset = () => router.get(route('out_service_centers.index'), {}, { preserveState: true, replace: true });

    const clearFilter = (key: 'search' | 'per_page') => {
        const updates: Partial<typeof localFilters> = {};
        if (key === 'search') updates.search = '';
        if (key === 'per_page') updates.per_page = '50';
        setLocalFilters(prev => ({ ...prev, ...updates }));
        navigate(updates);
    };

    const activeBadges = useMemo(() => {
        const badges: JSX.Element[] = [];
        if (localFilters.search) badges.push(
            <Badge key="search" variant="secondary" className="flex items-center gap-1 text-xs">
                Search: "{localFilters.search}"
                <button onClick={() => clearFilter('search')} className="ml-1 rounded-sm p-0.5 hover:bg-muted"><X className="h-3 w-3" /></button>
            </Badge>
        );
        if (localFilters.per_page !== '50') badges.push(
            <Badge key="per_page" variant="secondary" className="flex items-center gap-1 text-xs">
                Per Page: {localFilters.per_page}
                <button onClick={() => clearFilter('per_page')} className="ml-1 rounded-sm p-0.5 hover:bg-muted"><X className="h-3 w-3" /></button>
            </Badge>
        );
        if (!badges.length) badges.push(<span key="none" className="text-xs italic text-muted-foreground">No active filters</span>);
        return badges;
    }, [localFilters, clearFilter]);

    const handlePerPage = (v: string) => {
        setLocalFilters(p => ({ ...p, per_page: v }));
        navigate({ per_page: v });
    };

    return (
        <AppLayout>
            <Head title="Out Service Centers" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Out Service Centers</h1>
                        {can.create && (
                            <Button asChild>
                                <Link href={route('out_service_centers.create')}>
                                    <Plus className="mr-2 h-4 w-4" />Add Center
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* FILTER BAR */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Input
                            placeholder="Search service name / RMA…"
                            value={localFilters.search}
                            onChange={e => setLocalFilters(p => ({ ...p, search: e.target.value }))}
                            onKeyUp={e => e.key === 'Enter' && navigate()}
                            className="w-64"
                            disabled={isNavigating}
                        />
                        <Button size="sm" onClick={() => navigate()} disabled={isNavigating}><Search className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={handleReset} disabled={isNavigating}><RotateCcw className="h-4 w-4" /></Button>
                    </div>

                    {/* ACTIVE FILTERS */}
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md border">
                        <span className="font-medium">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">{activeBadges}</div>
                    </div>

                    {/* TABLE */}
                    <DataTable
                        data={centers.data}
                        pagination={centers}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPage}
                        onPageChange={page => navigate({ page })}
                        emptyMessage="No out-service centers found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>Service Name</TableHead>
                                <TableHead>RMA #</TableHead>
                                <TableHead>Sent At</TableHead>
                                <TableHead>Delivered By</TableHead> {/* ← NEW */}
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {centers.data.map(c => (
                                <TableRow key={c.id} className={c.deleted_at ? 'opacity-60' : ''}>
                                    <TableCell className="font-medium">
                                        <Link href={route('out_service_centers.show', c.id)} className="text-primary hover:underline">
                                            {c.service_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{c.job_card.rma_number}</TableCell>
                                    <TableCell>{new Date(c.sent_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{c.delivered_by_name ?? '—'}</TableCell> {/* ← NEW */}
                                    <TableCell className="text-right">
                                        {c.cost ? `₹${Number(c.cost).toFixed(2)}` : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={c.id}
                                            editRoute={route('out_service_centers.edit', c.id)}
                                            deleteRoute={route('out_service_centers.destroy', c.id)}
                                            restoreRoute={c.deleted_at ? route('out_service_centers.restore', c.id) : undefined}
                                            forceDeleteRoute={c.deleted_at ? route('out_service_centers.forceDelete', c.id) : undefined}
                                            isDeleted={!!c.deleted_at}
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
