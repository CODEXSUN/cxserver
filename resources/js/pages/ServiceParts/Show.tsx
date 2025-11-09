// resources/js/Pages/ServiceParts/Show.tsx
import { Button } from '@/components/ui/button';
import Layout from '@/layouts/app-layout';
import type { ServicePart, ServicePartImage } from '@/types/service-parts';
import { Storage } from '@/utils/storage';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { useRoute } from 'ziggy-js';

interface Props {
    part: ServicePart & { images: ServicePartImage[] };
    can: { edit: boolean; delete: boolean };
}

export default function Show({ part, can }: Props) {
    const route = useRoute();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Prepare slides with full image + thumbnail
    const slides = part.images.map((img) => ({
        src: Storage.url(img.image_path),
        thumbnail: Storage.url(img.thumb_path), // Fast preview
        alt: img.alt_text ?? undefined,
        title: img.alt_text || undefined,
    }));

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to move this part to trash?')) {
            router.delete(route('service_parts.destroy', part.id));
        }
    };

    return (
        <Layout>
            <Head title={`Part – ${part.part_code}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_parts.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">
                            {part.part_code} – {part.name}
                        </h1>
                    </div>

                    {/* Main Card */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        {/* Details */}
                        <div className="space-y-6 p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Part Code
                                    </label>
                                    <p className="mt-1 text-lg font-semibold">
                                        {part.part_code}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <p className="mt-1 text-lg">{part.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Brand
                                    </label>
                                    <p className="mt-1 text-lg">
                                        {part.brand || '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Model
                                    </label>
                                    <p className="mt-1 text-lg">
                                        {part.model || '—'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Unit Price
                                    </label>
                                    <p className="mt-1 font-mono text-lg">
                                        ₹{Number(part.unit_price).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current Stock
                                    </label>
                                    <p className="mt-1 text-lg">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                                part.current_stock > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {part.current_stock}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Barcode
                                    </label>
                                    <p className="mt-1 text-lg">
                                        {part.barcode || '—'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <p className="mt-1 text-lg whitespace-pre-wrap text-gray-600">
                                        {part.remarks || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*/!* Images *!/*/}
                        {/*{part.images.length > 0 && (*/}
                        {/*    <div className="border-t p-6">*/}
                        {/*        <h3 className="text-lg font-semibold mb-4">Images</h3>*/}
                        {/*        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">*/}
                        {/*            {part.images.map((img, idx) => (*/}
                        {/*                <div*/}
                        {/*                    key={img.id}*/}
                        {/*                    className="relative group cursor-pointer rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"*/}
                        {/*                    onClick={() => openLightbox(idx)}*/}
                        {/*                >*/}
                        {/*                    <img*/}
                        {/*                        src={Storage.url(img.thumb_path)}*/}
                        {/*                        alt={img.alt_text ?? `Image ${idx + 1}`}*/}
                        {/*                        className="w-full h-40 object-cover bg-gray-100"*/}
                        {/*                        loading="lazy"*/}
                        {/*                        onError={(e) => {*/}
                        {/*                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';*/}
                        {/*                        }}*/}
                        {/*                    />*/}
                        {/*                    {img.is_primary && (*/}
                        {/*                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">*/}
                        {/*                            Primary*/}
                        {/*                        </div>*/}
                        {/*                    )}*/}
                        {/*                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">*/}
                        {/*                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">*/}
                        {/*                            Click to enlarge*/}
                        {/*                        </span>*/}
                        {/*                    </div>*/}

                        {/*                </div>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}

                        {/*    </div>*/}
                        {/*)}*/}

                        {part.images.length > 0 && (
                            <div className="border-t p-6">
                                <h3 className="mb-4 text-lg font-semibold">
                                    Images
                                </h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {part.images.map((img, idx) => {
                                        const thumbUrl = Storage.url(
                                            img.thumb_path,
                                        );
                                        return (
                                            <div
                                                key={img.id}
                                                className="group relative cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
                                                onClick={() =>
                                                    openLightbox(idx)
                                                }
                                            >
                                                <img
                                                    src={thumbUrl}
                                                    alt={
                                                        img.alt_text ??
                                                        `Image ${idx + 1}`
                                                    }
                                                    className="h-40 w-full bg-gray-100 object-cover"
                                                    loading="lazy"
                                                    onLoad={() =>
                                                        console.log(
                                                            'Thumb loaded:',
                                                            thumbUrl,
                                                        )
                                                    }
                                                    onError={(e) => {
                                                        console.error(
                                                            'Thumb 404:',
                                                            thumbUrl,
                                                        );
                                                        e.currentTarget.src =
                                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                                    }}
                                                />
                                                {img.is_primary && (
                                                    <div className="absolute top-2 left-2 rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                                                        Primary
                                                    </div>
                                                )}
                                                <div className="group-hover:bg-opacity-30 absolute inset-0 flex items-center justify-center bg-black/10 transition">
                                                    <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                                                        Click to enlarge
                                                    </span>
                                                </div>

                                                {/* Inside image grid */}
                                                <div className="absolute top-2 right-2 opacity-0 transition group-hover:opacity-100">
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                confirm(
                                                                    'Delete this image?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    route(
                                                                        'service_parts.images.destroy',
                                                                        img.id,
                                                                    ),
                                                                    {
                                                                        preserveScroll: true,
                                                                        onSuccess:
                                                                            () =>
                                                                                router.reload(
                                                                                    {
                                                                                        only: [
                                                                                            'part',
                                                                                        ],
                                                                                    },
                                                                                ),
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/*/!*image test*!/*/}
                        {/*{part.images.length > 0 && (*/}
                        {/*    <div className="flex flex-wrap gap-4 mb-6">*/}
                        {/*        {part.images.map((img) => (*/}
                        {/*            <div key={img.id} className="relative group">*/}
                        {/*                <img*/}
                        {/*                    src={Storage.url(img.thumb_path)}*/}
                        {/*                    alt={img.alt_text ?? ''}*/}
                        {/*                    className="h-32 w-32 object-cover rounded border"*/}
                        {/*                />*/}
                        {/*                {img.is_primary && (*/}
                        {/*                    <div className="absolute top-1 left-1 bg-green-600 text-white rounded-full p-1">*/}
                        {/*                        <Check className="h-3 w-3" />*/}
                        {/*                    </div>*/}
                        {/*                )}*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*/!* DEBUG: Full Image URLs *!/*/}
                        {/*<div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded text-xs font-mono">*/}
                        {/*    <strong>Full Image URLs (click to test):</strong>*/}
                        {/*    <ul className="mt-2 space-y-1">*/}
                        {/*        {part.images.map(img => (*/}
                        {/*            <li key={img.id}>*/}
                        {/*                <a*/}
                        {/*                    href={Storage.url(img.image_path)}*/}
                        {/*                    target="_blank"*/}
                        {/*                    className="text-blue-600 hover:underline"*/}
                        {/*                >*/}
                        {/*                    {img.image_path}*/}
                        {/*                </a>*/}
                        {/*            </li>*/}
                        {/*        ))}*/}
                        {/*    </ul>*/}
                        {/*</div>*/}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                            {can.edit && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route(
                                            'service_parts.edit',
                                            part.id,
                                        )}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            {can.delete && (
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lightbox with Thumbnails */}
                {lightboxOpen && slides.length > 0 && (
                    <Lightbox
                        open={lightboxOpen}
                        close={() => setLightboxOpen(false)}
                        index={lightboxIndex}
                        slides={slides}
                        plugins={[Zoom, Fullscreen, Thumbnails]}
                        thumbnails={{
                            position: 'bottom',
                            width: 120,
                            height: 80,
                            border: 1,
                            borderRadius: 4,
                            padding: 4,
                            gap: 16,
                        }}
                        render={{
                            buttonPrev:
                                slides.length <= 1 ? () => null : undefined,
                            buttonNext:
                                slides.length <= 1 ? () => null : undefined,
                        }}
                        labels={{
                            Close: 'Close (Esc)',
                            Download: 'Download',
                            Fullscreen: 'Fullscreen',
                            Zoom: 'Zoom',
                        }}
                    />
                )}
            </div>
        </Layout>
    );
}
