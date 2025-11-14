// resources/js/Pages/CallLogs/Index.tsx
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
import { index as calls } from '@/routes/calls/index';
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

interface CallLog {
    id: number;
    mobile: string;
    call_type: 'incoming' | 'outgoing';
    duration: number | null;
    enquiry: string | null;
    created_at: string;
    deleted_at: string | null;
    contact: {
        id: number;
        name: string;
        company: string | null;
        mobile: string | null;
    };
    handler: { id: number; name: string } | null;
}

interface CallLogsPageProps {
    call_logs: {
        data: CallLog[];
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Call Logs', href: calls().url },
];

export default function Index() {
    const {
        call_logs,
        filters: serverFilters,
        can,
        trashedCount,
    } = usePage().props as unknown as CallLogsPageProps;
    const route = useRoute();

    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        date_from: serverFilters.date_from
            ? parseISO(serverFilters.date_from)
            : undefined,
        date_to: serverFilters.date_to
            ? parseISO(serverFilters.date_to)
            : undefined,
        per_page: serverFilters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            date_from: serverFilters.date_from
                ? parseISO(serverFilters.date_from)
                : undefined,
            date_to: serverFilters.date_to
                ? parseISO(serverFilters.date_to)
                : undefined,
            per_page: serverFilters.per_page || '50',
        });
    }, [serverFilters]);

    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
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

    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('calls.index'),
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

    const handleReset = () => {
        router.get(
            route('calls.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    const clearFilter = useCallback(
        (
            key:
                | 'search'
                | 'date_from'
                | 'date_to'
                | 'per_page',
        ) => {
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

        if (localFilters.date_from || localFilters.date_to) {
            badges.push(
                <Badge
                    key="date"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Date:{' '}
                    {localFilters.date_from
                        ? format(localFilters.date_from, 'MMM dd, yyyy')
                        : ''}{' '}
                    -{' '}
                    {localFilters.date_to
                        ? format(localFilters.date_to, 'MMM dd, yyyy')
                        : ''}
                    <button
                        onClick={() => clearFilter('date_from')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        return badges;
    }, [localFilters, clearFilter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Call Logs" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-64">
                                <Input
                                    placeholder="Search..."
                                    value={localFilters.search}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') navigate();
                                    }}
                                    className="pl-8"
                                />
                                <Search
                                    className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
                                />
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[280px] justify-between"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {localFilters.date_from ? (
                                            format(
                                                localFilters.date_from,
                                                'MMM dd, yyyy',
                                            )
                                        ) : (
                                            <span>Date From</span>
                                        )}{' '}
                                        -{' '}
                                        {localFilters.date_to ? (
                                            format(
                                                localFilters.date_to,
                                                'MMM dd, yyyy',
                                            )
                                        ) : (
                                            <span>Date To</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="flex">
                                        <Calendar
                                            mode="single"
                                            selected={localFilters.date_from}
                                            onSelect={(date) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    date_from: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                        <Separator orientation="vertical" />
                                        <Calendar
                                            mode="single"
                                            selected={localFilters.date_to}
                                            onSelect={(date) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    date_to: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                    </div>
                                    <div className="flex justify-end p-2">
                                        <Button
                                            size="sm"
                                            onClick={() => navigate()}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Select
                                value={localFilters.per_page}
                                onValueChange={(v) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        per_page: v,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="200">200</SelectItem>
                                </SelectContent>
                            </Select>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate()}
                                            disabled={isNavigating}
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Apply filters</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleReset}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reset filters</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="flex items-center gap-2">
                            {trashedCount > 0 && (
                                <Button variant="ghost" asChild>
                                    <Link href={route('calls.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('calls.create')}>
                                        <Plus className="mr-2 h-4 w-4" /> New Call Log
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters */}
                    {activeFilterBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {activeFilterBadges}
                        </div>
                    )}

                    {/* Table */}
                    <DataTable
                        data={call_logs.data}
                        pagination={call_logs}
                        routeName="calls.index"
                        isLoading={isNavigating}
                        onPageChange={navigate}
                        onPerPageChange={(perPage) => {
                            setLocalFilters((prev) => ({ ...prev, per_page: perPage }));
                            navigate({ per_page: perPage });
                        }}
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Enquiry</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Handler</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {call_logs.data.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className={log.deleted_at ? 'opacity-60' : ''}
                                >
                                    <TableCell className="font-medium">
                                        {log.deleted_at ? (
                                            <span className="text-muted-foreground">
                                                {log.mobile}
                                            </span>
                                        ) : (
                                            <Link
                                                href={route('calls.show', log.id)}
                                                className="hover:text-primary"
                                            >
                                                {log.mobile}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={route('contacts.index', log.contact.id)}
                                            className="hover:text-primary hover:underline"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {log.contact.name}
                                                </div>
                                                {log.contact.mobile && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {log.contact.mobile}
                                                    </div>
                                                )}
                                                {log.contact.company && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {log.contact.company}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {log.call_type.charAt(0).toUpperCase() + log.call_type.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {log.duration ? `${log.duration} sec` : '—'}
                                    </TableCell>
                                    <TableCell className="truncate max-w-xs">
                                        {log.enquiry || '—'}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(log.created_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {log.handler?.name || '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={log.id}
                                            editRoute={route('calls.edit', log.id)}
                                            deleteRoute={route('calls.destroy', log.id)}
                                            restoreRoute={
                                                log.deleted_at
                                                    ? route('calls.restore', log.id)
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                log.deleted_at
                                                    ? route('calls.forceDelete', log.id)
                                                    : undefined
                                            }
                                            isDeleted={!!log.deleted_at}
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
