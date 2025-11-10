// resources/js/Pages/OutServiceCenters/Show.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Storage } from '@/utils/storage';
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { useState } from 'react';

interface Center {
    id: number;
    service_name: string;
    job_card: { rma_number: string };
    sent_at: string;
    expected_back: string | null;
    cost: string | null;
    received_back_at: string | null;
    status: { name: string };
    notes: string | null;
    images: Array<{ id: number; image_path: string; thumb_path: string; alt_text: string | null }>;
}

interface Props { center: Center; can: { edit: boolean; delete: boolean }; }

export default function Show({ center, can }: Props) {
    const route = useRoute();
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const slides = center.images.map(i => ({
        src: Storage.url(i.image_path),
        thumbnail: Storage.url(i.thumb_path),
        alt: i.alt_text ?? undefined,
    }));

    const deleteCenter = () => {
        if (confirm('Move to trash?')) router.delete(route('out_service_centers.destroy', center.id));
    };

    return (
        <Layout>
            <Head title={center.service_name} />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild><Link href={route('out_service_centers.index')}><ArrowLeft className="h-5 w-5" /></Link></Button>
                        <h1 className="text-2xl font-bold">{center.service_name}</h1>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-gray-700">RMA #</label><p className="mt-1 text-lg">{center.job_card.rma_number}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Sent At</label><p className="mt-1 text-lg">{new Date(center.sent_at).toLocaleString()}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Expected Back</label><p className="mt-1 text-lg">{center.expected_back ? new Date(center.expected_back).toLocaleDateString() : '—'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Cost</label><p className="mt-1 text-lg">{center.cost ? `₹${Number(center.cost).toFixed(2)}` : '—'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Received Back</label><p className="mt-1 text-lg">{center.received_back_at ? new Date(center.received_back_at).toLocaleString() : '—'}</p></div>
                                <div><label className="block text-sm font-medium text-gray-700">Status</label><p className="mt-1 text-lg">{center.status.name}</p></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Notes</label><p className="mt-1 text-lg whitespace-pre-wrap">{center.notes || '—'}</p></div>
                                23                            </div>

                            {center.images.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Images</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {center.images.map((img, i) => (
                                            <div key={img.id} className="relative group cursor-pointer rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                                                 onClick={() => { setIndex(i); setOpen(true); }}>
                                                <img src={Storage.url(img.thumb_path)} alt={img.alt_text ?? ''} className="w-full h-40 object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                            {can.edit && <Button variant="outline" asChild><Link href={route('out_service_centers.edit', center.id)}><Edit className="mr-2 h-4 w-4" />Edit</Link></Button>}
                            {can.delete && <Button variant="destructive" onClick={deleteCenter}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
                        </div>
                    </div>
                </div>

                {open && slides.length > 0 && (
                    <Lightbox
                        open={open}
                        close={() => setOpen(false)}
                        index={index}
                        slides={slides}
                        plugins={[Zoom, Fullscreen, Thumbnails]}
                        thumbnails={{ position: 'bottom', width: 120, height: 80, border: 1, borderRadius: 4, padding: 4, gap: 16 }}
                    />
                )}
            </div>
        </Layout>
    );
}
