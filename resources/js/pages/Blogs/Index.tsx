// resources/js/Pages/Blogs/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Edit, Trash } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    body: string;
    published_at: string | null;
    created_at: string;
    author?: { name: string };
}

interface BlogsPageProps extends InertiaPageProps {
    blogs: {
        data: Blog[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    can: {
        create: boolean;
        delete: boolean;
    };
    trashedCount: number;
}

export default function Index() {
    const { blogs, can, trashedCount } = usePage<BlogsPageProps>().props;
    const route = useRoute();

    const handleDelete = (id: number) => {
        if (!confirm('Move this blog to trash?')) return;
        router.delete(route('blogs.destroy', id), { preserveScroll: true });
    };

    return (
        <Layout>
            <Head title="Blogs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your blog posts
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('blogs.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Blog
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('blogs.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Empty State */}
                    {blogs.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                <p className="text-muted-foreground">No blogs found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Blog Cards */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {blogs.data.map((blog) => (
                                    <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg line-clamp-2">
                                                    <Link
                                                        href={route('blogs.show', blog.slug)}
                                                        className="hover:text-primary transition-colors"
                                                    >
                                                        {blog.title}
                                                    </Link>
                                                </CardTitle>
                                                {blog.published_at ? (
                                                    <Badge variant="default">Published</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </div>
                                            <CardDescription>
                                                by {blog.author?.name ?? 'Unknown'} •{' '}
                                                {new Date(
                                                    blog.published_at ?? blog.created_at
                                                ).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                                {blog.body.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                            </p>

                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={route('blogs.edit', blog.id)}>
                                                        <Edit className="mr-1 h-3.5 w-3.5" />
                                                        Edit
                                                    </Link>
                                                </Button>

                                                {can.delete && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(blog.id)}
                                                    >
                                                        <Trash className="mr-1 h-3.5 w-3.5" />
                                                        Delete
                                                    </Button>
                                                )}
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
