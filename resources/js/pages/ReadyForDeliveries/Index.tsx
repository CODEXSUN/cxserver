// resources/js/Pages/ReadyForDeliveries/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { dashboard } from '@/routes';
import {index as ready_for_deliveries } from '@/routes/ready_for_deliveries';

interface Delivery {
    id: number;
    job_card: {
        job_no: string;
        service_inward: { rma: string };
        contact: { name: string; mobile: string | null };
    };
    user: { name: string };
    service_status: { name: string };
    billing_amount: string;
    delivered_confirmed_at: string | null;
    deleted_at: string | null;
}

interface IndexPageProps {
    deliveries: {
        data: Delivery[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

const breadcrumbs = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Ready for Delivery', href: ready_for_deliveries().url },
];

export default function Index() {
    const { deliveries, filters: serverFilters, can, trashedCount } = usePage<IndexPageProps>().props;
    const route = useRoute();

    // ──────────────────────────────────────────────────────────────
    // LOCAL STATE – filters + per-page
    // ──────────────────────────────────────────────────────────────
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
        date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
        per_page: serverFilters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server filters → local state
    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
            date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
            per_page: serverFilters.per_page || '50',
        });
    }, [serverFilters]);

    // Build URL payload
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            date_from: localFilters.date_from ? format(localFilters.date_from, 'yyyy-MM-dd') : undefined,
            date_to: localFilters.date_to ? format(localFilters.date_to, 'yyyy-MM-dd') : undefined,
            per_page: localFilters.per_page,
        }),
        [localFilters],
    );

    // Navigate with filters
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('ready_for_deliveries.index'),
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
        router.get(route('ready_for_deliveries.index'), {}, { preserveState: true, replace: true });
    };

    // Clear single filter
    const clearFilter = useCallback(
        (key: 'search' | 'date_from' | 'date_to' | 'per_page') => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
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
                <Badge key="search" variant="secondary" className="flex items-center gap-1 text-xs">
                    Search: "{localFilters.search}"
                    <button onClick={() => clearFilter('search')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.date_from || localFilters.date_to) {
            badges.push(
                <Badge key="date" variant="secondary" className="flex items-center gap-1 text-xs">
                    Date:{' '}
                    {localFilters.date_from ? format(localFilters.date_from, 'dd MMM') : '...'}{' '}
                    - {localFilters.date_to ? format(localFilters.date_to, 'dd MMM yyyy') : '...'}
                    <button onClick={() => clearFilter('date_from')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.per_page !== '50') {
            badges.push(
                <Badge key="per_page" variant="secondary" className="flex items-center gap-1 text-xs">
                    Per Page: {localFilters.per_page}
                    <button onClick={() => clearFilter('per_page')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (badges.length === 0) {
            badges.push(
                <span key="none" className="text-xs text-muted-foreground inline-flex items-center italic">
                    No active filters
                </span>,
            );
        }

        return badges;
    }, [localFilters, clearFilter]);

    // Handle per-page change
    const handlePerPageChange = (perPage: number) => {
        setLocalFilters((prev) => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ready for Delivery" />

            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Ready for Delivery
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">
                                Manage deliveries ready for customer pickup
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('ready_for_deliveries.create')}>
                                        <Plus className="mr-2 h-4 w-4" /> New
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('ready_for_deliveries.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Trash ({trashedCount})
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
                                placeholder="Search Job No, RMA, Customer..."
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

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-9 w-48 flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {localFilters.date_from || localFilters.date_to
                                        ? `${localFilters.date_from ? format(localFilters.date_from, 'dd MMM') : '...'} - ${localFilters.date_to ? format(localFilters.date_to, 'dd MMM') : '...'}`
                                        : 'Filter by Date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{
                                        from: localFilters.date_from,
                                        to: localFilters.date_to,
                                    }}
                                    onSelect={(range) => {
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            date_from: range?.from,
                                            date_to: range?.to,
                                        }));
                                        navigate({
                                            date_from: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
                                            date_to: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
                                        });
                                    }}
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
                        data={deliveries.data}
                        pagination={deliveries}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No deliveries ready."
                        isLoading={isNavigating}
                    >
                        <table className="w-full">
                            <thead>
                            <tr className="bg-muted font-semibold">
                                <th className="text-left px-4 py-3">Job No</th>
                                <th className="text-left px-4 py-3">RMA</th>
                                <th className="text-left px-4 py-3">Customer</th>
                                <th className="text-left px-4 py-3">Engineer</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-left px-4 py-3">Amount</th>
                                <th className="text-center px-4 py-3">Confirmed</th>
                                <th className="text-right px-4 py-3">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {deliveries.data.map((d) => (
                                <tr
                                    key={d.id}
                                    className={`border-t ${d.deleted_at ? 'opacity-60' : ''}`}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        <Link
                                            href={route('job_cards.show', d.job_card.job_no)}
                                            className="hover:text-primary"
                                        >
                                            {d.job_card.job_no}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">{d.job_card.service_inward.rma}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium">{d.job_card.contact.name}</div>
                                            {d.job_card.contact.mobile && (
                                                <div className="text-xs text-muted-foreground">
                                                    {d.job_card.contact.mobile}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{d.user.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline">{d.service_status.name}</Badge>
                                    </td>
                                    <td className="px-4 py-3">₹{d.billing_amount}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={d.delivered_confirmed_at ? 'default' : 'secondary'}>
                                            {d.delivered_confirmed_at ? 'Yes' : 'No'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <TableActions
                                            id={d.id}
                                            editRoute={route('ready_for_deliveries.edit', d.id)}
                                            deleteRoute={route('ready_for_deliveries.destroy', d.id)}
                                            restoreRoute={d.deleted_at ? route('ready_for_deliveries.restore', d.id) : undefined}
                                            forceDeleteRoute={d.deleted_at ? route('ready_for_deliveries.forceDelete', d.id) : undefined}
                                            isDeleted={!!d.deleted_at}
                                            canDelete={can.delete}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </DataTable>
                </div>
            </div>
        </AppLayout>
    );
}
