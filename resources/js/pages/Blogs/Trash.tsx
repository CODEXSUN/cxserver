// resources/js/Pages/Blogs/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

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
    const route = useRoute();
    const { blogs } = usePage<TrashPageProps>().props;
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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Trashed Blogs
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {blogs.total} blog{blogs.total !== 1 ? 's' : ''} in trash
                                    </p>
                                </div>
                                <Link
                                    href={route('blogs.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition"
                                >
                                    ← Back to Blogs
                                </Link>
                            </div>

                            {/* Empty State */}
                            {blogs.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No blogs in trash.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Blog List */}
                                    <ul className="space-y-4">
                                        {blogs.data.map((blog) => (
                                            <li
                                                key={blog.id}
                                                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-red-900 dark:text-red-300">
                                                        {blog.title}
                                                    </h3>
                                                    <p className="text-sm text-red-700 dark:text-red-400">
                                                        by {blog.author?.name ?? 'Unknown'} •{' '}
                                                        Deleted on {new Date(blog.deleted_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRestore(blog.id)}
                                                        disabled={processing === blog.id}
                                                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        {processing === blog.id ? 'Restoring...' : 'Restore'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleForceDelete(blog.id)}
                                                        disabled={processing === blog.id}
                                                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        {processing === blog.id ? 'Deleting...' : 'Delete Forever'}
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Pagination */}
                                    {blogs.links && blogs.links.length > 3 && (
                                        <div className="mt-6 flex flex-wrap gap-1 justify-center">
                                            {blogs.links.map((link, idx) => {
                                                if (!link.url) {
                                                    return (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-2 text-sm text-gray-500"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={idx}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                                            link.active
                                                                ? 'bg-red-600 text-white'
                                                                : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
