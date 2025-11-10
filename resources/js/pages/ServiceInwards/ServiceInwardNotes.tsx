'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit2, Reply, Send, Trash2 } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { useRoute } from 'ziggy-js';

// ---------------------------------------------------------------------
// PAGE PROPS TYPE (from Show.tsx)
// ---------------------------------------------------------------------
interface PageProps {
    notes?: Note[];
    auth?: { user?: { id: number } };
}

interface Note {
    id: number;
    note: string;
    user?: { id: number; name: string } | null;
    created_at: string;
    replies?: Note[] | null;
    is_reply: boolean;
}

interface Props {
    inwardId: number;
}

// ---------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------
export default function ServiceInwardNotes({ inwardId }: Props) {
    const { props } = usePage<PageProps>();
    const currentUserId = props.auth?.user?.id ?? 0;
    const route = useRoute();

    // Memoize notes to prevent useEffect re-run
    const notes = useMemo(() => (props.notes || []) as Note[], [props.notes]);

    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [editing, setEditing] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        note: '',
        parent_id: null as number | null,
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector(
                '[data-radix-scroll-area-viewport]',
            );
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, [notes]);

    const handleReload = () => {
        router.reload({ only: ['notes'], preserveScroll: true });
    };

    const submitNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.note.trim()) return;

        post(route('service_inwards.notes.store', inwardId), {
            preserveScroll: true,
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
            preserveScroll: true,
            onSuccess: () => {
                setEditing(null);
                handleReload();
            },
        });
    };

    const deleteNote = (noteId: number) => {
        if (!confirm('Delete this note?')) return;
        router.delete(
            route('service_inwards.notes.destroy', [inwardId, noteId]),
            {
                preserveScroll: true,
                onSuccess: () => handleReload(),
            },
        );
    };

    const renderNote = (note: Note, depth = 0): JSX.Element => {
        const user = note.user ?? { id: 0, name: 'Unknown' };
        const isOwn = user.id === currentUserId;

        // Main message: left for others, right for own
        const align = isOwn ? 'justify-start' : 'justify-end';
        const bubbleBg = isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted';
        const textColor = isOwn ? 'text-primary-foreground' : 'text-foreground';

        // Reply (when replying to a message): right for own reply, left otherwise
        const replyAlign = isOwn ? 'justify-start' : 'justify-end';

        const safeReplies: Note[] = Array.isArray(note.replies)
            ? note.replies
            : [];

        return (
            <div
                key={note.id}
                className={`flex w-full ${align} mb-4 ${depth > 0 ? 'ml-10' : ''}`}
            >
                <div
                    className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2`}
                >
                    {/* Avatar (only left, top-level) */}
                    {!isOwn && depth === 0 && (
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}

                    {/* Message Bubble */}
                    <div
                        className={`rounded-2xl px-4 py-2 ${bubbleBg} w-full shadow-sm`}
                    >
                        {/* User Name (Always shown, except in edit mode) */}
                        {editing !== note.id && (
                            <p
                                className={`mb-1 text-xs font-semibold ${isOwn ? 'text-primary-foreground/80' : 'opacity-80'}`}
                            >
                                {user.name}
                                {depth > 0 && (
                                    <span className="ml-1 text-xs font-normal opacity-60">
                                        replied
                                    </span>
                                )}
                            </p>
                        )}

                        {/* Edit Mode */}
                        {editing === note.id ? (
                            <div>
                                <Textarea
                                    value={editText}
                                    onChange={(e) => {
                                        setEditText(e.target.value);
                                        setData('note', e.target.value);
                                    }}
                                    className="min-h-0 rounded-md border bg-background text-sm"
                                    autoFocus
                                />
                                <div className="mt-2 flex gap-1">
                                    <Button
                                        size="sm"
                                        onClick={() => saveEdit(note.id)}
                                        disabled={processing}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditing(null)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p
                                    className={`text-sm ${textColor} break-words whitespace-pre-wrap`}
                                >
                                    {note.note}
                                </p>
                                <p
                                    className={`mt-1 text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                                >
                                    {format(
                                        new Date(note.created_at),
                                        'h:mm a',
                                    )}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions: Always below the message */}
                {editing !== note.id && (
                    <div
                        className={`mt-2 flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-center`}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            setReplyingTo(note.id);
                                            setData('parent_id', note.id);
                                        }}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Reply className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Reply</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {isOwn && (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => startEdit(note)}
                                                className="text-amber-600 hover:text-amber-700"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() =>
                                                    deleteNote(note.id)
                                                }
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        )}
                    </div>
                )}

                {/* Reply Form: Aligned to right for own replies, left for others */}
                {replyingTo === note.id && (
                    <div className={`mt-3 flex w-full ${replyAlign}`}>
                        <div
                            className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} w-full gap-2`}
                        >
                            <div className="flex-1">
                                <Textarea
                                    placeholder="Write a reply..."
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    className="min-h-0 resize-none text-sm"
                                    rows={2}
                                />
                                <div className="mt-2 flex gap-1">
                                    <Button
                                        size="sm"
                                        onClick={submitNote}
                                        disabled={
                                            processing || !data.note.trim()
                                        }
                                    >
                                        <Send className="mr-1 h-3 w-3" /> Send
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setReplyingTo(null);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Render Replies (indented further) */}
                {safeReplies.length > 0 && (
                    <div className="mt-3">
                        {safeReplies.map((reply) =>
                            renderNote(reply, depth + 1),
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-6 flex flex-col rounded-xl border bg-card p-4 shadow-md">
            <ScrollArea className="flex-1 pr-3" ref={scrollRef}>
                {notes.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        No notes yet. Start the conversation!
                    </p>
                ) : (
                    <div className="space-y-4">{notes.map(renderNote)}</div>
                )}
            </ScrollArea>

            <form
                onSubmit={submitNote}
                className="mt-4 border-t bg-background pt-4"
            >
                <div className="flex gap-3">
                    <Textarea
                        placeholder="Type your message..."
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="min-h-0 flex-1 resize-none text-sm"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submitNote(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={processing || !data.note.trim()}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
