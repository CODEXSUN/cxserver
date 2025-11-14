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
    Pencil,
} from 'lucide-react';

import DataTable from '@/components/table/DataTable';
import { priorities } from '@/components/ux/status'; // Adjust the import path as necessary

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
function DraggableTodoRow({ todo, setEditTodo, setDeleteTodo }: { todo: Todo; setEditTodo: (todo: Todo) => void; setDeleteTodo: (todo: Todo) => void; }) {
    const { setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 10 : 0,
    };

    const priorityConfig = priorities[todo.priority];

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={todo.completed ? 'text-green-600 line-through opacity-70' : ''}
        >
            <TableCell>
                <DragHandleWithId id={todo.id} todo={todo} />
            </TableCell>
            <TableCell>
                <CompletionCheckbox todo={todo} />
            </TableCell>
            <TableCell>{todo.title}</TableCell>
            <TableCell className="text-center flex justify-center items-center">
                <Badge className={priorityConfig.className}>
                    {priorityConfig.label}
                </Badge>
            </TableCell>
            <TableCell>{todo.assignee?.name || '—'}</TableCell>
            <TableCell>
                {todo.due_date ? format(new Date(todo.due_date), 'dd MMM yyyy') : '—'}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditTodo(todo)} className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTodo(todo)} className="h-7 w-7 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </TableCell>
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

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} onClick={() => handleSubmit()}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteConfirmDialog({
                                 todo,
                                 open,
                                 onOpenChange,
                             }: {
    todo: Todo;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const route = useRoute();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('todos.destroy', todo.id), {
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['todos'] });
                onOpenChange(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Todo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Are you sure you want to delete "{todo.title}"?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function Index() {
    const {
        todos: todosPaginated,
        filters: serverFilters,
        can,
        users,
        trashedCount,
    } = usePage<TodosPageProps>().props;

    const route = useRoute();

    const [data, setData] = useState(todosPaginated.data);
    const [localFilters, setLocalFilters] = useState({
        search: serverFilters.search || '',
        visibility: serverFilters.visibility || 'all',
        priority: serverFilters.priority || 'all',
        assignee_id: serverFilters.assignee_id || 'all',
        my_tasks: serverFilters.my_tasks || '0',
        completed: serverFilters.completed || 'all',
        date_from: serverFilters.date_from || '',
        date_to: serverFilters.date_to || '',
        per_page: serverFilters.per_page || '50',
    });
    const [isNavigating, setIsNavigating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editTodo, setEditTodo] = useState<Todo | null>(null);
    const [deleteTodo, setDeleteTodo] = useState<Todo | null>(null);

    useEffect(() => {
        setData(todosPaginated.data);
        setLocalFilters({
            search: serverFilters.search || '',
            visibility: serverFilters.visibility || 'all',
            priority: serverFilters.priority || 'all',
            assignee_id: serverFilters.assignee_id || 'all',
            my_tasks: serverFilters.my_tasks || '0',
            completed: serverFilters.completed || 'all',
            date_from: serverFilters.date_from || '',
            date_to: serverFilters.date_to || '',
            per_page: serverFilters.per_page || '50',
        });
    }, [todosPaginated, serverFilters]);

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
                            {localFilters.search && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    Search: "{localFilters.search}"
                                    <button onClick={() => clearFilter('search')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {localFilters.visibility && localFilters.visibility !== 'all' && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    Visibility: {localFilters.visibility.charAt(0).toUpperCase() + localFilters.visibility.slice(1)}
                                    <button onClick={() => clearFilter('visibility')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {localFilters.priority && localFilters.priority !== 'all' && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    Priority: {localFilters.priority.charAt(0).toUpperCase() + localFilters.priority.slice(1)}
                                    <button onClick={() => clearFilter('priority')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {localFilters.completed && localFilters.completed !== 'all' && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    Status: {localFilters.completed === 'yes' ? 'Completed' : 'Pending'}
                                    <button onClick={() => clearFilter('completed')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {/* Per Page Badge – only if not default (50) */}
                            {localFilters.per_page !== '50' && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                    Per Page: {localFilters.per_page}
                                    <button onClick={() => clearFilter('per_page')} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {/* No active filters fallback */}
                            {!(
                                localFilters.search ||
                                (localFilters.visibility && localFilters.visibility !== 'all') ||
                                (localFilters.priority && localFilters.priority !== 'all') ||
                                (localFilters.completed && localFilters.completed !== 'all') ||
                                localFilters.per_page !== '50'
                            ) && (
                                <span className="text-xs text-muted-foreground inline-flex items-center italic">
                No active filters
            </span>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                        <DataTable
                            data={data}
                            pagination={todosPaginated}
                            perPage={parseInt(localFilters.per_page)}
                            onPerPageChange={handlePerPageChange}
                            onPageChange={(page) => navigate({ page })}
                            emptyMessage="No todos found."
                            isLoading={isNavigating}
                        >
                            <TableHeader>
                                <TableRow className="bg-muted font-semibold">
                                    <TableHead style={{ width: 80 }}></TableHead>
                                    <TableHead style={{ width: 50 }}></TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead style={{ width: 120 }}  className="text-center" >Priority</TableHead>
                                    <TableHead style={{ width: 150 }} >Assignee</TableHead>
                                    <TableHead style={{ width: 80 }} >Due</TableHead>
                                    <TableHead style={{ width: 80 }} className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                                    {data.map((todo) => (
                                        <DraggableTodoRow key={todo.id} todo={todo} setEditTodo={setEditTodo} setDeleteTodo={setDeleteTodo} />
                                    ))}
                                </SortableContext>
                            </TableBody>
                        </DataTable>
                    </DndContext>
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
