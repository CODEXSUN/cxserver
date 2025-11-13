// resources/js/Pages/Todos/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface UserOption { id: number; name: string; }

interface CreatePageProps {
    users: UserOption[];
    nextPosition?: number;
}

export default function Create() {
    const route = useRoute();
    const { users, nextPosition } = usePage<CreatePageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        position: nextPosition?.toString() || '',
        assignee_id: '',
        visibility: 'personal',
        priority: 'medium',
        due_date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('todos.store'));
    };

    return (
        <Layout>
            <Head title="Create Todo" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('todos.index')}><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">New Todo</h1>
                            <p className="text-muted-foreground">Add a new task</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={data.priority} onValueChange={v => setData('priority', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="assignee_id">Assign To</Label>
                                <Select value={data.assignee_id} onValueChange={v => setData('assignee_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Unassigned</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={data.visibility} onValueChange={v => setData('visibility', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="work">Work</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input id="due_date" type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="position">Position (Order)</Label>
                                <Input id="position" type="number" value={data.position} onChange={e => setData('position', e.target.value)} placeholder={nextPosition?.toString() || 'Auto'} />
                                {nextPosition && !data.position && (
                                    <p className="text-xs text-green-600 mt-1">Suggested: {nextPosition}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} rows={4} />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('todos.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Create Todo'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
