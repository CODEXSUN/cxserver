import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';

interface User { id: number; name: string; email: string; roles: { name: string }[]; deleted_at: string; }
interface Props { users: { data: User[]; links: any[]; total: number }; can: { restore: boolean; delete: boolean }; }

export default function Trash() {
    const { users, can } = usePage<Props>().props;
    const route = useRoute();

    const restore = (id: number) => router.post(route('users.restore', id), {}, { preserveScroll: true });
    const force  = (id: number) => router.delete(route('users.forceDelete', id), { preserveScroll: true });

    return (
        <Layout>
            <Head title="Trashed Users" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Trashed Users ({users.total})</h1>
                    <Button variant="outline" asChild>
                        <Link href={route('users.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />Back
                        </Link>
                    </Button>
                </div>

                {users.data.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">Trash is empty</CardContent></Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {users.data.map(u => (
                            <Card key={u.id}>
                                <CardContent className="pt-6">
                                    <div className="font-semibold">{u.name}</div>
                                    <div className="text-sm text-muted-foreground">{u.email}</div>
                                    <div className="my-2">
                                        {u.roles.map(r => <Badge key={r.name} variant="outline" className="mr-1">{r.name}</Badge>)}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {can.restore && (
                                            <Button size="sm" variant="secondary" onClick={() => restore(u.id)}>
                                                <RotateCcw className="mr-1 h-4 w-4" />Restore
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <Button size="sm" variant="destructive" onClick={() => force(u.id)}>
                                                <Trash2 className="mr-1 h-4 w-4" />Delete Forever
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
