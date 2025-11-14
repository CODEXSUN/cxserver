// resources/js/Pages/CallLogs/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';
import { index as calls } from '@/routes/calls/index';
import type { BreadcrumbItem } from '@/types';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, X } from 'lucide-react';

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
            <Head title="Todos" />
            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Todos
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">
                                Track your todos
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button
                                    // onClick={() => setShowCreate(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> New Todo
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('todos.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />
                </div>
            </div>
        </AppLayout>
    );
}
