// resources/js/Pages/Blogs/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useRoute } from 'ziggy-js';

export default function Create() {
    // --------------------------------------------------------------
    // Inertia form helper (POST → blogs.store)
    // --------------------------------------------------------------
    const route = useRoute();
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        body: '',
        published: false,
    });

    // --------------------------------------------------------------
    // Local UI state
    // --------------------------------------------------------------
    const [showPreview, setShowPreview] = useState(false);

    // --------------------------------------------------------------
    // Handlers
    // --------------------------------------------------------------
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('blogs.store'), {
            onSuccess: () => reset(),
        });
    };

    // --------------------------------------------------------------
    // Render
    // --------------------------------------------------------------
    return (
        <Layout>
            <Head title="Create Blog" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    Create New Blog
                                </h1>
                                <Link
                                    href={route('blogs.index')}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    ← Back to Blogs
                                </Link>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter a catchy title..."
                                        required
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Body */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="body"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Content
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPreview(!showPreview)
                                            }
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            {showPreview ? 'Edit' : 'Preview'}
                                        </button>
                                    </div>

                                    {showPreview ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-gray-50 p-4 dark:bg-gray-900">
                                            {data.body ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: marked(
                                                            data.body,

                                                        ),
                                                    }}
                                                />
                                            ) : (
                                                <p className="text-gray-400 italic">
                                                    Nothing to preview yet.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <textarea
                                            id="body"
                                            rows={12}
                                            value={data.body}
                                            onChange={(e) =>
                                                setData('body', e.target.value)
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                            placeholder="Write your blog post in Markdown..."
                                            required
                                        />
                                    )}
                                    {errors.body && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.body}
                                        </p>
                                    )}
                                </div>

                                {/* Published */}
                                <div className="flex items-center">
                                    <input
                                        id="published"
                                        type="checkbox"
                                        checked={data.published}
                                        onChange={(e) =>
                                            setData(
                                                'published',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label
                                        htmlFor="published"
                                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        Publish immediately
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Create Blog'}
                                    </button>

                                    <Link
                                        href={route('blogs.index')}
                                        className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

/* ------------------------------------------------------------------
   OPTIONAL: Simple client‑side Markdown preview (no extra deps)
   ------------------------------------------------------------------ */
function marked(md: string): string {
    // Very tiny markdown → HTML (supports #, ##, **bold**, *italic*, lists, links)
    return md
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\n/gim, '<br>');
}
