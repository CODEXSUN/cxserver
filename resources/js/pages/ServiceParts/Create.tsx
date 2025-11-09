// resources/js/Pages/ServiceParts/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const route = useRoute();
    const { data, setData, post, processing, errors } = useForm({
        part_code: '',
        name: '',
        brand: '',
        model: '',
        unit_price: '',
        current_stock: '0',
        remarks: '',
        barcode: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('service_parts.store'));
    };

    return (
        <Layout>
            <Head title="Add Service Part" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_parts.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Add New Part</h1>
                            <p className="text-muted-foreground">Create a new spare part entry</p>
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
                                {processing ? 'Saving...' : 'Create Part'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
