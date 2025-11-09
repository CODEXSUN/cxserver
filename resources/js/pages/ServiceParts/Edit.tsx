// resources/js/Pages/ServiceParts/Edit.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface Part {
    id: number;
    part_code: string;
    name: string;
    brand: string | null;
    model: string | null;
    unit_price: number;
    current_stock: number;
    remarks: string | null;
    barcode: string | null;
}

interface Props {
    part: Part;
}

export default function Edit() {
    const route = useRoute();
    const { part } = usePage().props as unknown as Props;

    const { data, setData, put, processing, errors } = useForm({
        part_code: part.part_code,
        name: part.name,
        brand: part.brand ?? '',
        model: part.model ?? '',
        unit_price: part.unit_price.toString(),
        current_stock: part.current_stock.toString(),
        remarks: part.remarks ?? '',
        barcode: part.barcode ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('service_parts.update', part.id));
    };

    return (
        <Layout>
            <Head title="Edit Service Part" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_parts.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Part</h1>
                            <p className="text-muted-foreground">Update part details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <Label htmlFor="part_code">Part Code <span className="text-red-500">*</span></Label>
                                <Input id="part_code" value={data.part_code}
                                       onChange={e => setData('part_code', e.target.value)} />
                                {errors.part_code && <p className="mt-1 text-sm text-red-600">{errors.part_code}</p>}
                            </div>

                            <div>
                                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                <Input id="name" value={data.name}
                                       onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="brand">Brand</Label>
                                <Input id="brand" value={data.brand}
                                       onChange={e => setData('brand', e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="model">Model</Label>
                                <Input id="model" value={data.model}
                                       onChange={e => setData('model', e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="unit_price">Unit Price <span className="text-red-500">*</span></Label>
                                <Input id="unit_price" type="number" step="0.01"
                                       value={data.unit_price}
                                       onChange={e => setData('unit_price', e.target.value)} />
                                {errors.unit_price && <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>}
                            </div>

                            <div>
                                <Label htmlFor="current_stock">Current Stock <span className="text-red-500">*</span></Label>
                                <Input id="current_stock" type="number" min="0"
                                       value={data.current_stock}
                                       onChange={e => setData('current_stock', e.target.value)} />
                                {errors.current_stock && <p className="mt-1 text-sm text-red-600">{errors.current_stock}</p>}
                            </div>

                            <div>
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input id="barcode" value={data.barcode}
                                       onChange={e => setData('barcode', e.target.value)} />
                                {errors.barcode && <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="remarks">Remarks (optional)</Label>
                                <Textarea id="remarks" rows={3}
                                          value={data.remarks}
                                          onChange={e => setData('remarks', e.target.value)} />
                            </div>

                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('service_parts.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Part'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
