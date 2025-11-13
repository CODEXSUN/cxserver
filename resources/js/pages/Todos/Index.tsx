// resources/js/Pages/Todos/Index.tsx
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
import { Label } from '@/components/ui/label';               // <-- ADDED
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
import { index as todos } from '@/routes/todos/index';
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

/* ────────────────────────────────────────────────────────────── */
/*  Types (mirrored from ServiceInward)                          */
/* ────────────────────────────────────────────────────────────── */
interface Todo {
    id: number;
    title: string;
    priority: 'low' | 'medium' | 'high';
    visibility: string;
    due_date: string | null;
    completed: boolean;
    assignee: { id: number; name: string } | null;
    user: { id: number; name: string };
    deleted_at: string | null;
}

interface TodosPageProps {
    todos: {
        data: Todo[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        visibility?: string;
        priority?: string;
        assignee_id?: string;
        my_tasks?: '1' | '0';
        completed?: 'all' | 'yes' | 'no';
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    can: { create: boolean; delete: boolean };
    users: { id: number; name: string }[];
    trashedCount: number;
}

/* ────────────────────────────────────────────────────────────── */
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Todos', href: todos().url },
];

export default function Index() {
    const {
        todos: todosPaginated,
        filters: serverFilters,
        can,
        users,
        trashedCount,
    } = usePage<TodosPageProps>().props;
    const route = useRoute();

    /* ────────────────────────────────────────────────────────── */
    /*  Local filter state + sync with server                     */
    /* ────────────────────────────────────────────────────────── */
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        visibility: serverFilters.visibility || 'all',
        priority: serverFilters.priority || 'all',
        assignee_id: serverFilters.assignee_id || 'all',
        my_tasks: serverFilters.my_tasks === '1',
        completed: serverFilters.completed || 'all',
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
            visibility: serverFilters.visibility || 'all',
            priority: serverFilters.priority || 'all',
            assignee_id: serverFilters.assignee_id || 'all',
            my_tasks: serverFilters.my_tasks === '1',
            completed: serverFilters.completed || 'all',
            date_from: serverFilters.date_from
                ? parseISO(serverFilters.date_from)
                : undefined,
            date_to: serverFilters.date_to
                ? parseISO(serverFilters.date_to)
                : undefined,
            per_page: serverFilters.per_page || '50',
        });
    }, [serverFilters]);

    /* ────────────────────────────────────────────────────────── */
    /*  Payload builder                                            */
    /* ────────────────────────────────────────────────────────── */
    const buildPayload = useCallback(
        () => ({
            search: localFilters.search || undefined,
            visibility:
                localFilters.visibility === 'all' ? undefined : localFilters.visibility,
            priority:
                localFilters.priority === 'all' ? undefined : localFilters.priority,
            assignee_id:
                localFilters.assignee_id === 'all' ? undefined : localFilters.assignee_id,
            my_tasks: localFilters.my_tasks ? '1' : undefined,
            completed:
                localFilters.completed === 'all' ? undefined : localFilters.completed,
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

    /* ────────────────────────────────────────────────────────── */
    /*  Navigation helper                                          */
    /* ────────────────────────────────────────────────────────── */
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('todos.index'),
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

    /* ────────────────────────────────────────────────────────── */
    /*  Reset all filters                                          */
    /* ────────────────────────────────────────────────────────── */
    const handleReset = () => {
        router.get(route('todos.index'), {}, { preserveState: true, replace: true });
    };

    /* ────────────────────────────────────────────────────────── */
    /*  Clear a single filter                                      */
    /* ────────────────────────────────────────────────────────── */
    const clearFilter = useCallback(
        (
            key:
                | 'search'
                | 'visibility'
                | 'priority'
                | 'assignee_id'
                | 'my_tasks'
                | 'completed'
                | 'date_from'
                | 'date_to'
                | 'per_page',
        ) => {
            const updates: Partial<typeof localFilters> = {};
            if (key === 'search') updates.search = '';
            if (key === 'visibility') updates.visibility = 'all';
            if (key === 'priority') updates.priority = 'all';
            if (key === 'assignee_id') updates.assignee_id = 'all';
            if (key === 'my_tasks') updates.my_tasks = false;
            if (key === 'completed') updates.completed = 'all';
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

    /* ────────────────────────────────────────────────────────── */
    /*  Active filter badges (exact same style as ServiceInward)   */
    /* ────────────────────────────────────────────────────────── */
    const activeFilterBadges = useMemo(() => {
        const badges: JSX.Element[] = [];

        if (localFilters.search)
            badges.push(
                <Badge key="search" variant="secondary" className="flex items-center gap-1">
                    Search: "{localFilters.search}"
                    <button onClick={() => clearFilter('search')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );

        if (localFilters.visibility !== 'all')
            badges.push(
                <Badge key="visibility" variant="secondary" className="flex items-center gap-1">
                    Visibility: {localFilters.visibility}
                    <button onClick={() => clearFilter('visibility')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );

        if (localFilters.priority !== 'all')
            badges.push(
                <Badge key="priority" variant="secondary" className="flex items-center gap-1">
                    Priority: {localFilters.priority}
                    <button onClick={() => clearFilter('priority')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );

        if (localFilters.assignee_id !== 'all') {
            const user = users.find((u) => u.id === Number(localFilters.assignee_id));
            badges.push(
                <Badge key="assignee" variant="secondary" className="flex items-center gap-1">
                    Assignee: {user?.name ?? '—'}
                    <button onClick={() => clearFilter('assignee_id')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );
        }

        if (localFilters.my_tasks)
            badges.push(
                <Badge key="my_tasks" variant="secondary" className="flex items-center gap-1">
                    My Tasks Only
                    <button onClick={() => clearFilter('my_tasks')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );

        if (localFilters.completed !== 'all')
            badges.push(
                <Badge key="completed" variant="secondary" className="flex items-center gap-1">
                    Status: {localFilters.completed === 'yes' ? 'Completed' : 'Pending'}
                    <button onClick={() => clearFilter('completed')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );

        if (localFilters.date_from || localFilters.date_to)
            badges.push(
                <Badge key="date_range" variant="secondary" className="flex items-center gap-1">
                    Date Range:{' '}
                    {localFilters.date_from ? format(localFilters.date_from, 'dd MMM yyyy') : '—'} to{' '}
                    {localFilters.date_to ? format(localFilters.date_to, 'dd MMM yyyy') : '—'}
                    <button onClick={() => clearFilter('date_from')}>
                        <X className="h-3 w-3" />
                    </button>
                </Badge>,
            );

        return badges;
    }, [localFilters, users, clearFilter]);

    return (
        <AppLayout>
            <Head title="Todos" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* ── BREADCRUMBS ── */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {breadcrumbs.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {i > 0 && <span>/</span>}
                                    {item.href ? (
                                        <Link href={item.href} className="hover:text-foreground">
                                            {item.title}
                                        </Link>
                                    ) : (
                                        <span className="text-foreground">{item.title}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── HEADER ── */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Todos</h1>
                        <div className="flex items-center gap-4">
                            {can.create && (
                                <Button size="sm" asChild>
                                    <Link href={route('todos.create')}>
                                        <Plus className="mr-2 h-4 w-4" /> New Todo
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('todos.trash')}>
                                                    <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                                    <Badge
                                                        variant="destructive"
                                                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                                                    >
                                                        {trashedCount}
                                                    </Badge>
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>View Trashed</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>

                    {/* ── FILTER BAR ── */}
                    <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Filters</h2>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
                                <RotateCcw className="h-4 w-4" /> Reset
                            </Button>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search todos..."
                                    value={localFilters.search}
                                    onChange={(e) =>
                                        setLocalFilters((p) => ({ ...p, search: e.target.value }))
                                    }
                                    onKeyDown={(e) => e.key === 'Enter' && navigate()}
                                    className="pl-9"
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <Label>Visibility</Label>
                                <Select
                                    value={localFilters.visibility}
                                    onValueChange={(v) => {
                                        setLocalFilters((p) => ({ ...p, visibility: v }));
                                        navigate({ visibility: v === 'all' ? undefined : v });
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={localFilters.priority}
                                    onValueChange={(v) => {
                                        setLocalFilters((p) => ({ ...p, priority: v }));
                                        navigate({ priority: v === 'all' ? undefined : v });
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assignee */}
                            <div>
                                <Label>Assignee</Label>
                                <Select
                                    value={localFilters.assignee_id}
                                    onValueChange={(v) => {
                                        setLocalFilters((p) => ({ ...p, assignee_id: v }));
                                        navigate({ assignee_id: v === 'all' ? undefined : v });
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* My Tasks */}
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Input
                                        type="checkbox"
                                        checked={localFilters.my_tasks}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setLocalFilters((p) => ({ ...p, my_tasks: checked }));
                                            navigate({ my_tasks: checked ? '1' : undefined });
                                        }}
                                    />
                                    <span className="text-sm">My Tasks Only</span>
                                </label>
                            </div>

                            {/* Status */}
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={localFilters.completed}
                                    onValueChange={(v) => {
                                        setLocalFilters((p) => ({ ...p, completed: v }));
                                        navigate({ completed: v === 'all' ? undefined : v });
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="yes">Completed</SelectItem>
                                        <SelectItem value="no">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Range */}
                            <div>
                                <Label>Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {localFilters.date_from ? (
                                                <>
                                                    {format(localFilters.date_from, 'dd MMM yyyy')} -{' '}
                                                    {localFilters.date_to
                                                        ? format(localFilters.date_to, 'dd MMM yyyy')
                                                        : '—'}
                                                </>
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
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
                                                setLocalFilters((p) => ({
                                                    ...p,
                                                    date_from: range?.from,
                                                    date_to: range?.to,
                                                }));
                                                navigate({
                                                    date_from: range?.from
                                                        ? format(range.from, 'yyyy-MM-dd')
                                                        : undefined,
                                                    date_to: range?.to
                                                        ? format(range.to, 'yyyy-MM-dd')
                                                        : undefined,
                                                });
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Per Page */}
                            <div>
                                <Label>Per Page</Label>
                                <Select
                                    value={localFilters.per_page}
                                    onValueChange={(v) => {
                                        setLocalFilters((p) => ({ ...p, per_page: v }));
                                        navigate({ per_page: v });
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                        <SelectItem value="200">200</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Active Badges */}
                        {activeFilterBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">{activeFilterBadges}</div>
                        )}
                    </div>

                    {/* ── TABLE ── */}
                    <DataTable
                        data={todosPaginated.data}
                        pagination={todosPaginated}
                        onPageChange={(page) => navigate({ page })}
                        emptyMessage="No todos found."
                        isLoading={isNavigating}
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Due</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {todosPaginated.data.map((todo) => (
                                <TableRow
                                    key={todo.id}
                                    // className={todo.deleted_at ?. 'opacity-60' : ''}
                                >
                                    <TableCell className="font-medium">
                                        <Link
                                            href={route('todos.show', todo.id)}
                                            className="hover:text-primary"
                                        >
                                            {todo.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                todo.priority === 'high'
                                                    ? 'destructive'
                                                    : todo.priority === 'low'
                                                        ? 'secondary'
                                                        : 'default'
                                            }
                                        >
                                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{todo.assignee?.name || '—'}</TableCell>
                                    <TableCell>
                                        {todo.due_date
                                            ? format(new Date(todo.due_date), 'dd MMM yyyy')
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={todo.completed ? 'default' : 'destructive'}>
                                            {todo.completed ? 'Done' : 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={todo.id}
                                            editRoute={route('todos.edit', todo.id)}
                                            deleteRoute={route('todos.destroy', todo.id)}
                                            restoreRoute={
                                                todo.deleted_at
                                                    ? route('todos.restore', todo.id)
                                                    : undefined
                                            }
                                            forceDeleteRoute={
                                                todo.deleted_at
                                                    ? route('todos.forceDelete', todo.id)
                                                    : undefined
                                            }
                                            isDeleted={!!todo.deleted_at}
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
