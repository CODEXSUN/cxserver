// resources/js/Pages/Blogs/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { useRoute } from 'ziggy-js';

interface Blog {
    id: number;
    title: string;
    slug: string;
    body: string;
    published_at: string | null;
    created_at: string;
    deleted_at: string;
    author?: { name: string };
}

interface TrashPageProps extends InertiaPageProps {
    blogs: {
        data: Blog[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Trash() {
    const { blogs } = usePage<TrashPageProps>().props;
    const route = useRoute();
    const [processing, setProcessing] = useState<number | null>(null);

    const handleRestore = (id: number) => {
        if (!confirm('Restore this blog?')) return;
        setProcessing(id);
        router.post(route('blogs.restore', id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const handleForceDelete = (id: number) => {
        if (!confirm('Permanently delete this blog? This cannot be undone.')) return;
        setProcessing(id);
        router.delete(route('blogs.forceDelete', id), {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <Layout>
            <Head title="Trash" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Blogs</h1>
                            <p className="text-muted-foreground mt-1">
                                {blogs.total} blog{blogs.total !== 1 ? 's' : ''} in trash
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('blogs.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blogs
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    {/* Empty State */}
                    {blogs.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                <p className="text-muted-foreground">No blogs in trash.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Trash Cards */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {blogs.data.map((blog) => (
                                    <Card key={blog.id} className="border-destructive/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg line-clamp-2 text-destructive">
                                                {blog.title}
                                            </CardTitle>
                                            <CardDescription>
                                                by {blog.author?.name ?? 'Unknown'} • Deleted on{' '}
                                                {new Date(blog.deleted_at).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {blog.body.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                            </p>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleRestore(blog.id)}
                                                    disabled={processing === blog.id}
                                                >
                                                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                    {processing === blog.id ? 'Restoring...' : 'Restore'}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleForceDelete(blog.id)}
                                                    disabled={processing === blog.id}
                                                >
                                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                    {processing === blog.id ? 'Deleting...' : 'Delete Forever'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {blogs.links && blogs.links.length > 3 && (
                                <nav className="flex items-center justify-center gap-1 mt-8">
                                    {blogs.links.map((link, idx) => {
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
                                                <Link
                                                    href={link.url}
                                                    preserveScroll
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
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
