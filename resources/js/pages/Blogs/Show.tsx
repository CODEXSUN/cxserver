// resources/js/Pages/Blogs/Show.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

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
    const route = useRoute();
    const { blog, can } = usePage<ShowPageProps>().props;

    const handleDelete = () => {
        if (!confirm('Move this blog to trash?')) return;
        router.delete(route('blogs.destroy', blog.id), {
            preserveScroll: true,
        });
    };

    return (
        <Layout>
            <Head title={blog.title} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <Link
                                    href={route('blogs.index')}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    ← All Blogs
                                </Link>

                                <div className="flex gap-2">
                                    {can.edit && (
                                        <Link
                                            href={route('blogs.edit', blog.id)}
                                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                    {can.delete && (
                                        <button
                                            onClick={handleDelete}
                                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {blog.title}
                            </h1>

                            {/* Meta */}
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                                <span>by {blog.author?.name ?? 'Unknown'}</span>
                                <span className="mx-2">•</span>
                                <time>
                                    {blog.published_at
                                        ? new Date(blog.published_at).toLocaleDateString()
                                        : 'Draft'}
                                </time>
                            </div>

                            {/* Body – Markdown rendered */}
                            <article
                                className="prose prose-lg dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: marked(blog.body),
                                }}
                            />

                            {/* Optional: Show raw markdown (dev only) */}
                            {/* <details className="mt-8">
                <summary className="text-sm cursor-pointer text-gray-500">View raw Markdown</summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-xs overflow-x-auto">
                  {blog.body}
                </pre>
              </details> */}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

/* ------------------------------------------------------------------
   Client‑side Markdown → HTML (supports common syntax)
   ------------------------------------------------------------------ */
function marked(md: string): string {
    return md
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-4" />')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
        .replace(/\n/gim, '<br>');
}
