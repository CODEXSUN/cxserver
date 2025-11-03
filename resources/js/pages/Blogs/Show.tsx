// resources/js/Pages/Blogs/Show.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useRoute } from 'ziggy-js';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    body: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author?: { name: string };
}

interface ShowPageProps extends InertiaPageProps {
    blog: Blog;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function Show() {
    const { blog, can } = usePage<ShowPageProps>().props;
    const route = useRoute();

    const handleDelete = () => {
        if (!confirm('Move this blog to trash?')) return;
        router.delete(route('blogs.destroy', blog.id), { preserveScroll: true });
    };

    return (
        <Layout>
            <Head title={blog.title} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('blogs.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                All Blogs
                            </Link>
                        </Button>

                        <div className="flex gap-2">
                            {can.edit && (
                                <Button size="sm" variant="secondary" asChild>
                                    <Link href={route('blogs.edit', blog.id)}>
                                        <Edit className="mr-1 h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            {can.delete && (
                                <Button size="sm" variant="destructive" onClick={handleDelete}>
                                    <Trash className="mr-1 h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Blog Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>
                                {blog.published_at ? (
                                    <Badge>Published</Badge>
                                ) : (
                                    <Badge variant="secondary">Draft</Badge>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground mt-2">
                                by {blog.author?.name ?? 'Unknown'} •{' '}
                                {blog.published_at
                                    ? new Date(blog.published_at).toLocaleDateString()
                                    : 'Not published'}
                            </p>
                        </CardHeader>

                        <CardContent>
                            <article
                                className="prose prose-lg dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: marked(blog.body) }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

/* ------------------------------------------------------------------
   Client‑side Markdown → HTML
   ------------------------------------------------------------------ */
function marked(md: string): string {
    return md
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-4" />')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline">$1</a>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
        .replace(/\n/gim, '<br>');
}
