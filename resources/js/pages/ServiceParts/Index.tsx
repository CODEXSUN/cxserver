// resources/js/Pages/ServiceParts/Index.tsx
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
import { dashboard } from '@/routes';
import { index as service_parts } from '@/routes/service_parts/index';
import type { BreadcrumbItem } from '@/types';

interface Part {
    id: number;
    part_code: string;
    name: string;
    brand: string | null;
    model: string | null;
    unit_price: number;
    current_stock: number;
    deleted_at: string | null;
}

interface Props {
    parts: {
        data: Part[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        stock_filter?: 'all' | 'in_stock' | 'out_of_stock';
        per_page?: string;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Service Parts', href: service_parts().url },
];

export default function Index() {
    const { parts, filters, can, trashedCount } = usePage().props as unknown as Props;
    const route = useRoute();

    // ──────────────────────────────────────────────────────────────
    // LOCAL STATE
    // ──────────────────────────────────────────────────────────────
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        stock_filter: filters.stock_filter || 'all',
        per_page: filters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server → local
    useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            stock_filter: filters.stock_filter || 'all',
            per_page: filters.per_page || '50',
        });
    }, [filters]);

    // ──────────────────────────────────────────────────────────────
    // PAYLOAD
    // ──────────────────────────────────────────────────────────────
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            stock_filter:
                localFilters.stock_filter === 'all' ? undefined : localFilters.stock_filter,
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
                route('service_parts.index'),
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
        router.get(route('service_parts.index'), {}, { preserveState: true, replace: true });

    // ──────────────────────────────────────────────────────────────
    // CLEAR SINGLE FILTER
    // ──────────────────────────────────────────────────────────────
    const clearFilter = useCallback(
        (key: 'search' | 'stock_filter' | 'per_page') => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
            if (key === 'stock_filter') updates.stock_filter = 'all';
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

        if (localFilters.stock_filter !== 'all') {
            badges.push(
                <Badge key="stock" variant="secondary" className="flex items-center gap-1 text-xs">
                    Stock:{' '}
                    {localFilters.stock_filter === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                    <button
                        onClick={() => clearFilter('stock_filter')}
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
    }, [localFilters, clearFilter]);

    // ──────────────────────────────────────────────────────────────
    // PER-PAGE HANDLER
    // ──────────────────────────────────────────────────────────────
    const handlePerPage = (perPage: number) => {
        setLocalFilters((prev) => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    // ──────────────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Parts" />

            <div className="py-6">
                <div className="mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Service Parts
                            </h1>
                            <p className="mt-1 text-sm text-black/30">
                                Manage spare parts inventory
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('service_parts.create')}>
                                        <Plus className="mr-2 h-4 w-4" />Add Part
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('service_parts.trash')}>
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
                                placeholder="Search part code / name / brand / model"
                                className="h-9 pl-10"
                                value={localFilters.search}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
                                }
                                onKeyUp={(e) => e.key === 'Enter' && navigate()}
                                disabled={isNavigating}
                            />
                        </div>

                        {/* Stock Filter */}
                        <Select
                            value={localFilters.stock_filter}
                            onValueChange={(
                                v: 'all' | 'in_stock' | 'out_of_stock',
                            ) => {
                                setLocalFilters((prev) => ({ ...prev, stock_filter: v }));
                                navigate({ stock_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-[160px]">
                                <SelectValue placeholder="All Stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stock</SelectItem>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
                        data={parts.data}
                        pagination={parts}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPage}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No parts found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold text-foreground">
                                <TableHead>Part Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Brand / Model</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-center">Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parts.data.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className={p.deleted_at ? 'opacity-60' : ''}
                                >
                                    <TableCell className="font-medium">
                                        <Link
                                            href={route('service_parts.show', p.id)}
                                            className="text-primary hover:underline font-semibold"
                                        >
                                            {p.part_code}
                                        </Link>
                                    </TableCell>

                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>
                                        {p.brand || ''} {p.model ? `/ ${p.model}` : ''}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ₹{Number(p.unit_price).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={p.current_stock > 0 ? 'default' : 'destructive'}
                                        >
                                            {p.current_stock}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={p.id}
                                            editRoute={route('service_parts.edit', p.id)}
                                            deleteRoute={route('service_parts.destroy', p.id)}
                                            restoreRoute={
                                                p.deleted_at
                                                    ? route('service_parts.restore', p.id)
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                p.deleted_at
                                                    ? route('service_parts.forceDelete', p.id)
                                                    : undefined
                                            }
                                            isDeleted={!!p.deleted_at}
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
