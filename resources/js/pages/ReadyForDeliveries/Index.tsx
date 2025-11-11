// resources/js/Pages/ReadyForDeliveries/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Search, Trash2, X } from 'lucide-react';

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

export default function Index() {
    const { deliveries, filters: serverFilters, can, trashedCount } = usePage().props as unknown as IndexPageProps;
    const route = useRoute();

    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
        date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
        per_page: serverFilters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            date_from: serverFilters.date_from ? parseISO(serverFilters.date_from) : undefined,
            date_to: serverFilters.date_to ? parseISO(serverFilters.date_to) : undefined,
            per_page: serverFilters.per_page || '50',
        });
    }, [serverFilters]);

    const buildPayload = useCallback(() => ({
        search: localFilters.search || undefined,
        date_from: localFilters.date_from ? format(localFilters.date_from, 'yyyy-MM-dd') : undefined,
        date_to: localFilters.date_to ? format(localFilters.date_to, 'yyyy-MM-dd') : undefined,
        per_page: localFilters.per_page,
    }), [localFilters]);

    const navigate = useCallback((extra = {}) => {
        setIsNavigating(true);
        router.get(route('ready_for_deliveries.index'), { ...buildPayload(), ...extra }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsNavigating(false),
        });
    }, [route, buildPayload]);

    const clearFilter = useCallback((key: 'search' | 'date_from' | 'date_to' | 'per_page') => {
        const updates: any = {};
        if (key === 'search') updates.search = '';
        if (key === 'date_from' || key === 'date_to') {
            updates.date_from = undefined;
            updates.date_to = undefined;
        }
        if (key === 'per_page') updates.per_page = '50';
        setLocalFilters(prev => ({ ...prev, ...updates }));
        navigate(updates);
    }, [navigate]);

    const activeBadges = useMemo(() => {
        const badges: JSX.Element[] = [];
        if (localFilters.search) badges.push(
            <Badge key="search" variant="secondary" className="flex items-center gap-1 text-xs">
                Search: "{localFilters.search}"
                <button onClick={() => clearFilter('search')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                    <X className="h-3 w-3" />
                </button>
            </Badge>
        );
        if (localFilters.date_from || localFilters.date_to) badges.push(
            <Badge key="date" variant="secondary" className="flex items-center gap-1 text-xs">
                Date: {localFilters.date_from ? format(localFilters.date_from, 'dd MMM') : '...'} - {localFilters.date_to ? format(localFilters.date_to, 'dd MMM yyyy') : '...'}
                <button onClick={() => clearFilter('date_from')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                    <X className="h-3 w-3" />
                </button>
            </Badge>
        );
        return badges;
    }, [localFilters, clearFilter]);

    return (
        <AppLayout>
            <Head title="Ready for Delivery" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-bold">Ready for Delivery</h1>
                        <div className="flex gap-2">
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

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search Job No, RMA, Customer..."
                                value={localFilters.search}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalFilters(prev => ({ ...prev, search: val }));
                                    if (val.length === 0 || val.length >= 2) {
                                        navigate({ search: val });
                                    }
                                }}
                                className="pl-10"
                            />
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {localFilters.date_from || localFilters.date_to ? 'Date Set' : 'Filter by Date'}
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
                                        setLocalFilters(prev => ({
                                            ...prev,
                                            date_from: range?.from,
                                            date_to: range?.to,
                                        }));
                                        navigate({
                                            date_from: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
                                            date_to: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
                                        });
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {activeBadges.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {activeBadges}
                            <Button variant="ghost" size="sm" onClick={() => router.get(route('ready_for_deliveries.index'))}>
                                Clear all
                            </Button>
                        </div>
                    )}

                    <DataTable data={deliveries.data} pagination={deliveries} routeName="ready_for_deliveries.index">
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="text-left">Job No</th>
                                <th className="text-left">RMA</th>
                                <th className="text-left">Customer</th>
                                <th className="text-left">Engineer</th>
                                <th className="text-left">Status</th>
                                <th className="text-left">Amount</th>
                                <th className="text-left">Confirmed</th>
                                <th className="text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {deliveries.data.map((d) => (
                                <tr key={d.id} className={d.deleted_at ? 'opacity-60' : ''}>
                                    <td className="font-medium">{d.job_card.job_no}</td>
                                    <td>{d.job_card.service_inward.rma}</td>
                                    <td>{d.job_card.contact.name}</td>
                                    <td>{d.user.name}</td>
                                    <td>
                                        <Badge variant="outline">{d.service_status.name}</Badge>
                                    </td>
                                    <td>₹{d.billing_amount}</td>
                                    <td>
                                        {d.delivered_confirmed_at ? (
                                            <Badge variant="default">Yes</Badge>
                                        ) : (
                                            <Badge variant="secondary">No</Badge>
                                        )}
                                    </td>
                                    <td className="text-right">
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
