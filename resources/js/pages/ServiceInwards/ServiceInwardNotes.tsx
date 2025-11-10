// resources/js/Components/ServiceInwardNotes.tsx
import { usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Send, Trash2, Reply, Edit2, X, RotateCcw, Search, MessageSquare } from 'lucide-react';
import { useRoute } from 'ziggy-js';

interface Note {
    id: number;
    note: string;
    user: { id: number; name: string };
    created_at: string;
    replies: Note[];
    is_reply: boolean;
}

interface Props {
    inwardId: number;
    inwardRma: string;
}

export default function ServiceInwardNotes({ inwardId, inwardRma }: Props) {
    const { props } = usePage();
    const notes = (props.notes || []) as Note[];
    const serverFilters = (props.notes_filters || {}) as { notes_date_from?: string; notes_date_to?: string };
    const route = useRoute();

    const [open, setOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [editing, setEditing] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [localFilters, setLocalFilters] = useState({
        notes_date_from: serverFilters.notes_date_from ? parseISO(serverFilters.notes_date_from) : undefined,
        notes_date_to: serverFilters.notes_date_to ? parseISO(serverFilters.notes_date_to) : undefined,
    });
    const [isNavigating, setIsNavigating] = useState(false);

    const { data, setData, post, put, processing, reset } = useForm({
        note: '',
        parent_id: null as number | null,
    });

    // Sync server filters to local
    useEffect(() => {
        setLocalFilters({
            notes_date_from: serverFilters.notes_date_from ? parseISO(serverFilters.notes_date_from) : undefined,
            notes_date_to: serverFilters.notes_date_to ? parseISO(serverFilters.notes_date_to) : undefined,
        });
    }, [serverFilters]);

    // Load notes on open if not loaded
    useEffect(() => {
        if (open && notes.length === 0) {
            handleReload();
        }
    }, [open]);

    const buildPayload = useCallback(() => ({
        notes_date_from: localFilters.notes_date_from ? format(localFilters.notes_date_from, 'yyyy-MM-dd') : undefined,
        notes_date_to: localFilters.notes_date_to ? format(localFilters.notes_date_to, 'yyyy-MM-dd') : undefined,
    }), [localFilters]);

    const handleReload = () => {
        setIsNavigating(true);
        router.reload({
            data: buildPayload(),
            only: ['notes', 'notes_filters'],
            onFinish: () => setIsNavigating(false),
        });
    };

    const handleReset = () => {
        setLocalFilters({ notes_date_from: undefined, notes_date_to: undefined });
        router.reload({
            data: { notes_date_from: undefined, notes_date_to: undefined },
            only: ['notes', 'notes_filters'],
        });
    };

    const clearDateFilter = () => {
        setLocalFilters({ notes_date_from: undefined, notes_date_to: undefined });
        handleReload();
    };

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.note.trim()) return;

        const action = data.parent_id ? 'Reply' : 'Note';
        post(route('service_inwards.notes.store', inwardId), {
            onSuccess: () => {
                reset();
                setReplyingTo(null);
                handleReload();
            },
        });
    };

    const startEdit = (note: Note) => {
        setEditing(note.id);
        setEditText(note.note);
        setData('note', note.note);
    };

    const saveEdit = (noteId: number) => {
        put(route('service_inwards.notes.update', [inwardId, noteId]), {
            onSuccess: () => {
                setEditing(null);
                handleReload();
            },
        });
    };

    const deleteNote = (noteId: number) => {
        if (!confirm('Delete this note?')) return;
        router.delete(route('service_inwards.notes.destroy', [inwardId, noteId]), {
            onSuccess: () => handleReload(),
        });
    };

    const renderNote = (note: Note, depth = 0) => (
        <div key={note.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'} border-l-4 border-gray-200 pl-4`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{note.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-medium text-sm">{note.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), 'dd MMM yyyy, hh:mm a')}
                        </p>
                        {editing === note.id ? (
                            <div className="mt-2">
                                <Textarea
                                    value={editText}
                                    onChange={(e) => {
                                        setEditText(e.target.value);
                                        setData('note', e.target.value);
                                    }}
                                    className="text-sm"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={() => saveEdit(note.id)} disabled={processing}>Save</Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-sm whitespace-pre-wrap">{note.note}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs">
                            <button
                                onClick={() => {
                                    setReplyingTo(note.id);
                                    setData('parent_id', note.id);
                                }}
                                className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <Reply className="h-3 w-3" /> Reply
                            </button>
                            <button
                                onClick={() => startEdit(note)}
                                className="text-amber-600 hover:underline flex items-center gap-1"
                            >
                                <Edit2 className="h-3 w-3" /> Edit
                            </button>
                            <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-600 hover:underline flex items-center gap-1"
                            >
                                <Trash2 className="h-3 w-3" /> Delete
                            </button>
                        </div>
                        {replyingTo === note.id && (
                            <form onSubmit={submitNote} className="mt-3">
                                <Textarea
                                    placeholder="Write a reply..."
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="text-sm"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" type="submit" disabled={processing || !data.note.trim()}>
                                        <Send className="h-3 w-3 mr-1" /> Send
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setReplyingTo(null); reset(); }}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            {note.replies.map((reply) => renderNote(reply, depth + 1))}
        </div>
    );

    const activeDateBadge = (localFilters.notes_date_from || localFilters.notes_date_to) ? (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            Date: {localFilters.notes_date_from ? format(localFilters.notes_date_from, 'dd MMM') : '...'} - {localFilters.notes_date_to ? format(localFilters.notes_date_to, 'dd MMM yyyy') : '...'}
            <button onClick={clearDateFilter} className="ml-1 rounded-sm p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
            </button>
        </Badge>
    ) : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Communication Notes ({notes.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Communication Notes – {inwardRma}</DialogTitle>
                </DialogHeader>

                {/* Filters (Modeled after Index.tsx) */}
                <div className="flex items-center gap-4 mb-4">
                    <Label>Date Range:</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {localFilters.notes_date_from ? format(localFilters.notes_date_from, 'PPP') : <span>From</span>} - {localFilters.notes_date_to ? format(localFilters.notes_date_to, 'PPP') : <span>To</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={{ from: localFilters.notes_date_from, to: localFilters.notes_date_to }}
                                onSelect={(range) => {
                                    setLocalFilters({
                                        notes_date_from: range?.from,
                                        notes_date_to: range?.to,
                                    });
                                    handleReload();
                                }}
                                numberOfMonths={2}
                                disabled={isNavigating}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button size="sm" onClick={handleReload} disabled={isNavigating}>
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset} disabled={isNavigating}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Active Filters */}
                {activeDateBadge && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {activeDateBadge}
                    </div>
                )}

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-2">
                        {notes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No notes yet.</p>
                        ) : (
                            notes.map((note) => renderNote(note))
                        )}
                    </div>
                </ScrollArea>

                {/* Add New Note (Modeled after Create.tsx) */}
                <form onSubmit={submitNote} className="flex gap-2 mt-4">
                    <Textarea
                        placeholder="Add a note..."
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="flex-1"
                        rows={2}
                    />
                    <Button type="submit" disabled={processing || !data.note.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
