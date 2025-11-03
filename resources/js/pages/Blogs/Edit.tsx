// resources/js/Pages/Blogs/Edit.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    body: string;
    published_at: string | null;
    author?: { name: string };
}

interface EditPageProps extends InertiaPageProps {
    blog: Blog;
}

export default function Edit() {
    const route = useRoute();
    const { blog } = usePage<EditPageProps>().props;

    // --------------------------------------------------------------
    // Inertia form (PATCH → blogs.update)
    // --------------------------------------------------------------
    const { data, setData, patch, processing, errors, reset } = useForm({
        title: blog.title,
        body: blog.body,
        published: !!blog.published_at,
    });

    // --------------------------------------------------------------
    // UI state
    // --------------------------------------------------------------
    const [showPreview, setShowPreview] = useState(false);

    // --------------------------------------------------------------
    // Handlers
    // --------------------------------------------------------------
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('blogs.update', blog.id), { onSuccess: () => reset() });
    };

    return (
        <Layout>
            <Head title="Edit Blog" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Blog</h1>
                            <p className="text-muted-foreground mt-1">
                                Update your post below
                            </p>
                        </div>
                        <Button variant="ghost" asChild>
                            <Link href={route('blogs.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    {/* Form Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Details</CardTitle>
                            <CardDescription>
                                Edit title, content, and publishing status.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter a catchy title..."
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                {/* Body + Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="body">Content</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPreview(!showPreview)}
                                        >
                                            {showPreview ? (
                                                <>
                                                    <EyeOff className="mr-1 h-3.5 w-3.5" />
                                                    Edit
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="mr-1 h-3.5 w-3.5" />
                                                    Preview
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {showPreview ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 bg-muted/50">
                                            {data.body ? (
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: marked(data.body) }}
                                                />
                                            ) : (
                                                <p className="italic text-muted-foreground">
                                                    Nothing to preview yet.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <Textarea
                                            id="body"
                                            rows={14}
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            placeholder="Write your blog post in Markdown..."
                                            className="resize-none"
                                            required
                                        />
                                    )}
                                    {errors.body && (
                                        <p className="text-sm text-destructive">{errors.body}</p>
                                    )}
                                </div>

                                {/* Published */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="published"
                                        checked={data.published}
                                        onCheckedChange={(checked) => setData('published', checked)}
                                    />
                                    <Label htmlFor="published">Published</Label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Update Blog'}
                                    </Button>

                                    <Button variant="outline" asChild>
                                        <Link href={route('blogs.index')}>Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

/* ------------------------------------------------------------------
   Same tiny markdown renderer
   ------------------------------------------------------------------ */
function marked(md: string): string {
    return md
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\n/gim, '<br>');
}
