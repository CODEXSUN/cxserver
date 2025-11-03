// resources/js/Pages/Blogs/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useRoute } from 'ziggy-js';

// Define your custom props
interface BlogsPageProps extends InertiaPageProps {
    blogs: {
        data: Array<{
            id: number;
            title: string;
            slug: string;
            body: string;
            published_at: string | null;
            created_at: string;
            author?: { name: string };
        }>;
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

    return (
        <Layout>
            <Head title="Blog" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    Blogs
                                </h1>

                                <div className="flex gap-3">
                                    {can.create && (
                                        <Link
                                            href={route('blogs.create')}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                        >
                                            New Blog
                                        </Link>
                                    )}
                                    {trashedCount > 0 && (
                                        <Link
                                            href={route('blogs.trash')}
                                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                                        >
                                            Trash ({trashedCount})
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Blog List */}
                            {blogs.data.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400">
                                    No blogs found.
                                </p>
                            ) : (
                                <ul className="space-y-4">
                                    {blogs.data.map((blog) => (
                                        <li
                                            key={blog.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <Link
                                                    href={route('blogs.edit', blog.slug)}
                                                    className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {blog.title}
                                                </Link>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    by {blog.author?.name ?? 'Unknown'} •{' '}
                                                    {new Date(blog.published_at ?? blog.created_at).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('blogs.edit', blog.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit
                                                </Link>

                                                {can.delete && (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            if (confirm('Move this blog to trash?')) {
                                                                router.delete(route('blogs.destroy', blog.id));
                                                            }
                                                        }}
                                                        className="inline"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Pagination */}
                            {blogs.links && blogs.links.length > 3 && (
                                <div className="mt-6 flex gap-1 flex-wrap">
                                    {blogs.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 text-sm text-gray-500"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`px-3 py-1 text-sm rounded-md transition ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
