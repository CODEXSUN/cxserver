"use client";

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';
import { format, parseISO } from 'date-fns';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    Row,
    useReactTable,
} from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboard } from '@/routes';
import { index as todos } from '@/routes/todos/index';
import type { BreadcrumbItem } from '@/types';
import {
    Calendar as CalendarIcon,
    GripVertical,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Edit2,
} from 'lucide-react';

interface Todo {
    id: number;
    title: string;
    priority: 'low' | 'medium' | 'high';
    visibility: 'personal' | 'work' | 'public';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Todos', href: todos().url },
];

/* ── Drag Handle + ID ── */
function DragHandleWithId({ id, todo }: { id: UniqueIdentifier; todo: Todo }) {
    const { attributes, listeners, setNodeRef } = useSortable({ id });
    return (
        <div className="flex items-center gap-1">
            <Button
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                variant="ghost"
                size="icon"
                className="cursor-grab active:cursor-grabbing text-muted-foreground h-7 w-7"
            >
                <GripVertical className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">#{todo.id}</span>
        </div>
    );
}

/* ── Completion Checkbox ── */
function CompletionCheckbox({ todo }: { todo: Todo }) {
    const route = useRoute();
    const handleToggle = () => {
        router.patch(
            route('todos.toggle-complete', todo.id),
            { completed: !todo.completed },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['todos'] }),
            }
        );
    };

    return (
        <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />
    );
}

/* ── Draggable Row ── */
function DraggableRow({ row }: { row: Row<Todo> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({ id: row.original.id });
    const isCompleted = row.original.completed;

    return (
        <TableRow
            ref={setNodeRef}
            data-dragging={isDragging}
            data-completed={isCompleted}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.8 : 1,
                zIndex: isDragging ? 10 : 0,
            }}
            className={`
                data-[completed=true]:text-green-600
                data-[completed=true]:line-through
                data-[completed=true]:opacity-70
                data-[dragging=true]:shadow-lg
            `}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}

/* ── Form Validation Errors ── */
function FormError({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="text-sm text-destructive mt-1">{error}</p>;
}

/* ── Edit / Create Modal with Validation ── */
function TodoFormDialog({
                            todo,
                            open,
                            onOpenChange,
                        }: {
    todo?: Todo;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const route = useRoute();
    const users = usePage<TodosPageProps>().props.users;
    const isEdit = !!todo;

    const [form, setForm] = useState({
        title: todo?.title || '',
        priority: todo?.priority || 'medium',
        visibility: todo?.visibility || 'personal',
        assignee_id: todo?.assignee?.id?.toString() || '',
        due_date: todo?.due_date ? new Date(todo.due_date) : null,
        completed: todo?.completed || false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && todo) {
            setForm({
                title: todo.title,
                priority: todo.priority,
                visibility: todo.visibility,
                assignee_id: todo.assignee?.id?.toString() || '',
                due_date: todo.due_date ? new Date(todo.due_date) : null,
                completed: todo.completed,
            });
            setErrors({});
        }
        if (open && !todo) {
            setForm({
                title: '',
                priority: 'medium',
                visibility: 'personal',
                assignee_id: '',
                due_date: null,
                completed: false,
            });
            setErrors({});
        }
    }, [open, todo]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (form.assignee_id && !users.find(u => u.id.toString() === form.assignee_id)) {
            newErrors.assignee_id = 'Invalid assignee';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        setIsSubmitting(true);
        const payload: any = {
            title: form.title,
            priority: form.priority,
            visibility: form.visibility,
            assignee_id: form.assignee_id || null,
            due_date: form.due_date ? format(form.due_date, 'yyyy-MM-dd') : null,
            completed: form.completed,
        };

        const url = isEdit ? route('todos.update', todo!.id) : route('todos.store');

        router[isEdit ? 'patch' : 'post'](url, payload, {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['todos'] });
                onOpenChange(false);
            },
            onError: (err: any) => {
                setErrors(err);
                console.error('Save failed', err);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the todo details.' : 'Add a new todo to your list.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-1">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Enter title"
                            disabled={isSubmitting}
                        />
                        <FormError error={errors.title} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                            <Label>Priority</Label>
                            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })} disabled={isSubmitting}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1">
                            <Label>Visibility</Label>
                            <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v as any })} disabled={isSubmitting}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="work">Work</SelectItem>
                                    <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <Label>Assignee</Label>
                        <Select
                            value={form.assignee_id || 'none'}
                            onValueChange={(v) => setForm({ ...form, assignee_id: v === 'none' ? '' : v })}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormError error={errors.assignee_id} />
                    </div>

                    <div className="grid gap-1">
                        <Label>Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-start text-left font-normal" disabled={isSubmitting}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.due_date ? format(form.due_date, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={form.due_date}
                                    onSelect={(date) => setForm({ ...form, due_date: date || null })}
                                    initialFocus
                                    disabled={isSubmitting}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {isEdit && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="completed"
                                checked={form.completed}
                                onCheckedChange={(checked) => setForm({ ...form, completed: !!checked })}
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="completed">Mark as completed</Label>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Todo')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ── Delete Confirmation ── */
function DeleteConfirmDialog({ todo, open, onOpenChange }: { todo: Todo; open: boolean; onOpenChange: (open: boolean) => void }) {
    const route = useRoute();
    const handleDelete = () => {
        router.delete(route('todos.destroy', todo.id), {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['todos'] });
                onOpenChange(false);
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Todo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will move "<strong>{todo.title}</strong>" to trash.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/* ── Main Component ── */
export default function Index() {
    const { todos: todosPaginated, filters: serverFilters, can, trashedCount } = usePage<TodosPageProps>().props;
    const route = useRoute();

    const [localFilters, setLocalFilters] = useState({ ...serverFilters });
    const [isNavigating, setIsNavigating] = useState(false);
    const [data, setData] = useState<Todo[]>(todosPaginated.data);
    const [editTodo, setEditTodo] = useState<Todo | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [deleteTodo, setDeleteTodo] = useState<Todo | null>(null);

    useEffect(() => {
        setLocalFilters({ ...serverFilters });
        setData(todosPaginated.data);
    }, [serverFilters, todosPaginated.data]);

    const buildPayload = useCallback(() => ({
        search: localFilters.search || undefined,
        visibility: localFilters.visibility === 'all' ? undefined : localFilters.visibility,
        priority: localFilters.priority === 'all' ? undefined : localFilters.priority,
        assignee_id: localFilters.assignee_id === 'all' ? undefined : localFilters.assignee_id,
        my_tasks: localFilters.my_tasks === '1' ? '1' : undefined,
        completed: localFilters.completed === 'all' ? undefined : localFilters.completed,
        date_from: localFilters.date_from ? format(parseISO(localFilters.date_from), 'yyyy-MM-dd') : undefined,
        date_to: localFilters.date_to ? format(parseISO(localFilters.date_to), 'yyyy-MM-dd') : undefined,
        per_page: localFilters.per_page,
    }), [localFilters]);

    const navigate = useCallback((extra = {}) => {
        setIsNavigating(true);
        router.get(route('todos.index'), { ...buildPayload(), ...extra }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsNavigating(false),
        });
    }, [route, buildPayload]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = data.findIndex(d => d.id === active.id);
        const newIndex = data.findIndex(d => d.id === over.id);
        const newData = arrayMove(data, oldIndex, newIndex);

        setData(newData);
        router.post(route('todos.reorder'), { order: newData.map(t => t.id) }, {
            preserveState: true,
            onSuccess: () => router.reload({ only: ['todos'] }),
        });
    };

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200 } }),
        useSensor(KeyboardSensor),
    );

    const dataIds = useMemo<UniqueIdentifier[]>(() => data.map(d => d.id), [data]);

    const columns: ColumnDef<Todo>[] = [
        { id: 'drag-id', header: '', cell: ({ row }) => <DragHandleWithId id={row.original.id} todo={row.original} />, size: 80 },
        { id: 'completed', header: '', cell: ({ row }) => <CompletionCheckbox todo={row.original} />, size: 50 },
        { accessorKey: 'title', header: 'Title', cell: ({ row }) => row.original.title },
        { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => (
                <Badge variant={row.original.priority === 'high' ? 'destructive' : row.original.priority === 'low' ? 'secondary' : 'default'}>
                    {row.original.priority.charAt(0).toUpperCase() + row.original.priority.slice(1)}
                </Badge>
            )},
        { accessorKey: 'assignee', header: 'Assignee', cell: ({ row }) => row.original.assignee?.name || '—' },
        { accessorKey: 'due_date', header: 'Due', cell: ({ row }) => row.original.due_date ? format(new Date(row.original.due_date), 'dd MMM yyyy') : '—' },
        { id: 'actions', cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditTodo(row.original)} className="h-7 w-7">
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTodo(row.original)} className="h-7 w-7 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ), size: 100 },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { pagination: { pageIndex: todosPaginated.current_page - 1, pageSize: parseInt(localFilters.per_page) } },
        manualPagination: true,
        pageCount: todosPaginated.last_page,
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
            navigate({ page: newState.pageIndex + 1 });
        },
    });

    const clearFilter = (key: keyof typeof localFilters) => {
        const updates: any = { [key]: key === 'per_page' ? '50' : 'all' };
        if (key === 'my_tasks') updates.my_tasks = '0';
        setLocalFilters(prev => ({ ...prev, ...updates }));
        navigate(updates);
    };

    const handlePerPageChange = (perPage: number) => {
        setLocalFilters(prev => ({ ...prev, per_page: String(perPage) }));
        navigate({ per_page: perPage, page: 1 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Todos" />
            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">Todos</h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">Track your todos</p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button onClick={() => setShowCreate(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> New Todo
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('todos.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search Todos..."
                                className="h-9 pl-10"
                                value={localFilters.search || ''}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                                onKeyUp={(e) => e.key === 'Enter' && navigate()}
                                disabled={isNavigating}
                            />
                        </div>

                        <Select value={localFilters.visibility || 'all'} onValueChange={(v) => { setLocalFilters(prev => ({ ...prev, visibility: v })); navigate({ visibility: v === 'all' ? undefined : v }); }}>
                            <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Visibility</SelectItem>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.priority || 'all'} onValueChange={(v) => { setLocalFilters(prev => ({ ...prev, priority: v })); navigate({ priority: v === 'all' ? undefined : v }); }}>
                            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.completed || 'all'} onValueChange={(v) => { setLocalFilters(prev => ({ ...prev, completed: v })); navigate({ completed: v === 'all' ? undefined : v }); }}>
                            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="yes">Completed</SelectItem>
                                <SelectItem value="no">Pending</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-1">
                            <Button size="sm" className="h-9" onClick={() => navigate()} disabled={isNavigating}><Search className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" className="h-9" onClick={() => router.get(route('todos.index'), {}, { preserveState: true, replace: true })} disabled={isNavigating}><RotateCcw className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-3">
                        <span className="font-medium text-foreground">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">
                            {localFilters.search && <Badge variant="secondary" className="flex items-center gap-1">Search: "{localFilters.search}" <button onClick={() => clearFilter('search')}><X className="h-3 w-3" /></button></Badge>}
                            {localFilters.visibility && localFilters.visibility !== 'all' && <Badge variant="secondary" className="flex items-center gap-1">Visibility: {localFilters.visibility} <button onClick={() => clearFilter('visibility')}><X className="h-3 w-3" /></button></Badge>}
                            {localFilters.priority && localFilters.priority !== 'all' && <Badge variant="secondary" className="flex items-center gap-1">Priority: {localFilters.priority} <button onClick={() => clearFilter('priority')}><X className="h-3 w-3" /></button></Badge>}
                            {localFilters.completed && localFilters.completed !== 'all' && <Badge variant="secondary" className="flex items-center gap-1">Status: {localFilters.completed === 'yes' ? 'Completed' : 'Pending'} <button onClick={() => clearFilter('completed')}><X className="h-3 w-3" /></button></Badge>}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id} style={{ width: header.getSize() }}>
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                            {table.getRowModel().rows.map(row => <DraggableRow key={row.id} row={row} />)}
                                        </SortableContext>
                                    ) : (
                                        <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No todos found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label>Rows per page</Label>
                            <Select value={localFilters.per_page} onValueChange={(v) => handlePerPageChange(Number(v))}>
                                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                                <SelectContent>{[10, 25, 50, 100].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Page {todosPaginated.current_page} of {todosPaginated.last_page}</span>
                            <Button variant="outline" size="icon" onClick={() => navigate({ page: todosPaginated.current_page - 1 })} disabled={todosPaginated.current_page === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" onClick={() => navigate({ page: todosPaginated.current_page + 1 })} disabled={todosPaginated.current_page === todosPaginated.last_page}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <TodoFormDialog open={showCreate} onOpenChange={setShowCreate} />

            {/* Edit Modal */}
            {editTodo && <TodoFormDialog todo={editTodo} open={!!editTodo} onOpenChange={(open) => !open && setEditTodo(null)} />}

            {/* Delete Confirmation */}
            {deleteTodo && <DeleteConfirmDialog todo={deleteTodo} open={!!deleteTodo} onOpenChange={(open) => !open && setDeleteTodo(null)} />}
        </AppLayout>
    );
}
