import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';

interface Role {
    id: number;
    label: string;
}

interface Permission {
    id: number;
    name: string;
    label: string;
    roles: Role[];
    deleted_at: string;
}

interface TrashPageProps {
    permissions: {
        data: Permission[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    can: {
        restore: boolean;
        delete: boolean;
    };
}

export default function Trash() {
    const { permissions, can } = usePage<TrashPageProps>().props;
    const route = useRoute();
    const [processing, setProcessing] = useState<number | null>(null);

    const handleRestore = (id: number) => {
        if (!confirm('Restore this permission?')) return;
        setProcessing(id);
        router.post(route('permissions.restore', id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const handleForceDelete = (id: number) => {
        if (!confirm('Permanently delete this permission? This cannot be undone.')) return;
        setProcessing(id);
        router.delete(route('permissions.forceDelete', id), {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <Layout>
            <Head title="Trashed Permissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Permissions</h1>
                            <p className="text-muted-foreground mt-1">
                                {permissions.total} permission{permissions.total !== 1 ? 's' : ''} in trash
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('permissions.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Permissions
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    {permissions.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <Trash2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-medium">Trash is empty</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {permissions.data.map((perm) => (
                                    <Card key={perm.id}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{perm.label}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{perm.name}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {perm.roles.map((r) => (
                                                    <Badge key={r.id} variant="outline" className="text-xs">
                                                        {r.label}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                {can.restore && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleRestore(perm.id)}
                                                        disabled={processing === perm.id}
                                                    >
                                                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                        {processing === perm.id ? 'Restoring...' : 'Restore'}
                                                    </Button>
                                                )}
                                                {can.delete && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleForceDelete(perm.id)}
                                                        disabled={processing === perm.id}
                                                    >
                                                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                        {processing === perm.id ? 'Deleting...' : 'Delete Forever'}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {permissions.links && permissions.links.length > 3 && (
                                <nav className="flex items-center justify-center gap-1 mt-8">
                                    {permissions.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 text-sm text-muted-foreground"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Button
                                                key={idx}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={link.url} preserveScroll>
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </Link>
                                            </Button>
                                        );
                                    })}
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
