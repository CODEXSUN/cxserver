// resources/js/Pages/Contacts/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { index as contacts } from '@/routes/contacts';

interface Contact {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    company: string | null;
    has_web_access: boolean;
    active: boolean;
    deleted_at: string | null;
    contact_type: { id: number; name: string };
}

interface ContactsPageProps {
    contacts: {
        data: Contact[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    contactTypes: { id: number; name: string }[];
    filters: {
        search?: string;
        contact_type_id?: string;
        active_filter?: 'all' | 'yes' | 'no';
        per_page?: string;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Contacts', href: contacts().url },
];

export default function Index() {
    const {
        contacts,
        contactTypes,
        filters: serverFilters,
        can,
        trashedCount,
    } = usePage().props as unknown as ContactsPageProps;
    const route = useRoute();

    // ──────────────────────────────────────────────────────────────
    // LOCAL STATE – filters + per-page
    // ──────────────────────────────────────────────────────────────
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        contact_type_id: serverFilters.contact_type_id || 'all',
        active_filter: serverFilters.active_filter || 'all',
        per_page: serverFilters.per_page || '50',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server filters → local state
    useEffect(() => {
        setLocalFilters({
            search: serverFilters.search || '',
            contact_type_id: serverFilters.contact_type_id || 'all',
            active_filter: serverFilters.active_filter || 'all',
            per_page: serverFilters.per_page || '50',
        });
    }, [serverFilters]);

    // Build URL payload
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            contact_type_id:
                localFilters.contact_type_id === 'all'
                    ? undefined
                    : localFilters.contact_type_id,
            active_filter:
                localFilters.active_filter === 'all'
                    ? undefined
                    : localFilters.active_filter,
            per_page: localFilters.per_page,
        }),
        [localFilters],
    );

    // Navigate with filters
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('contacts.index'),
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
            route('contacts.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    // Clear single filter
    const clearFilter = useCallback(
        (
            key:
                | 'search'
                | 'contact_type_id'
                | 'active_filter'
                | 'per_page',
        ) => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
            if (key === 'contact_type_id') updates.contact_type_id = 'all';
            if (key === 'active_filter') updates.active_filter = 'all';
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

        if (localFilters.contact_type_id !== 'all') {
            const type = contactTypes.find(
                (t) => String(t.id) === localFilters.contact_type_id,
            );
            badges.push(
                <Badge
                    key="type"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Type: {type?.name || 'Unknown'}
                    <button
                        onClick={() => clearFilter('contact_type_id')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.active_filter !== 'all') {
            badges.push(
                <Badge
                    key="active"
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                >
                    Status:{' '}
                    {localFilters.active_filter === 'yes' ? 'Active' : 'Inactive'}
                    <button
                        onClick={() => clearFilter('active_filter')}
                        className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

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
    }, [localFilters, contactTypes, clearFilter]);

    // Handle per-page change from DataTable
    const handlePerPageChange = (perPage: number) => {
        setLocalFilters((prev) => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />

            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Contacts
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">
                                Manage your contacts
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('contacts.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Contact
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('contacts.trash')}>
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
                                placeholder="Search by name, email, mobile..."
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
                            value={localFilters.contact_type_id}
                            onValueChange={(v: string) => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    contact_type_id: v,
                                }));
                                navigate({ contact_type_id: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-48">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {contactTypes.map((type) => (
                                    <SelectItem
                                        key={type.id}
                                        value={String(type.id)}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={localFilters.active_filter}
                            onValueChange={(
                                v: 'all' | 'yes' | 'no',
                            ) => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    active_filter: v,
                                }));
                                navigate({ active_filter: v });
                            }}
                            disabled={isNavigating}
                        >
                            <SelectTrigger className="h-9 w-40">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="yes">Active</SelectItem>
                                <SelectItem value="no">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

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
                        data={contacts.data}
                        pagination={contacts}
                        perPage={parseInt(localFilters.per_page)}
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage={
                            localFilters.contact_type_id !== 'all' ||
                            localFilters.active_filter !== 'all' ||
                            localFilters.search
                                ? 'No contacts match your filters.'
                                : 'No contacts yet.'
                        }
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow className="bg-muted font-semibold">
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-center">
                                    Web Access
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.data.map((contact) => (
                                <TableRow
                                    key={contact.id}
                                    className={
                                        contact.deleted_at ? 'opacity-60' : ''
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {contact.deleted_at ? (
                                            <span className="text-muted-foreground">
                                                {contact.name}
                                            </span>
                                        ) : (
                                            <Link
                                                href={route(
                                                    'contacts.show',
                                                    contact.id,
                                                )}
                                                className="hover:text-primary"
                                            >
                                                {contact.name}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>{contact.mobile}</TableCell>
                                    <TableCell>
                                        {contact.email || (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {contact.company || (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {contact.contact_type.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                contact.active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {contact.active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                contact.has_web_access
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {contact.has_web_access
                                                ? 'Yes'
                                                : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={contact.id}
                                            editRoute={route(
                                                'contacts.edit',
                                                contact.id,
                                            )}
                                            deleteRoute={route(
                                                'contacts.destroy',
                                                contact.id,
                                            )}
                                            restoreRoute={
                                                contact.deleted_at
                                                    ? route(
                                                        'contacts.restore',
                                                        contact.id,
                                                    )
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                contact.deleted_at
                                                    ? route(
                                                        'contacts.forceDelete',
                                                        contact.id,
                                                    )
                                                    : undefined
                                            }
                                            isDeleted={!!contact.deleted_at}
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
