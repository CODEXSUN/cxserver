// resources/js/Pages/ServiceInwards/Edit.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface ContactOption {
    id: number;
    name: string;
    company: string | null;
}

interface ServiceInward {
    id: number;
    rma: string;
    contact_id: number;
    material_type: string;
    brand: string | null;
    model: string | null;
    serial_no: string | null;
    passwords: string | null;
    photo_url: string | null;
    observation: string | null;
    received_date: string | null;
}

interface EditPageProps {
    inward: ServiceInward;
    contacts: ContactOption[];
}

export default function Edit() {
    const route = useRoute();
    const { inward, contacts } = usePage().props as unknown as EditPageProps;

    const { data, setData, put, processing, errors } = useForm({
        rma: inward.rma,
        contact_id: String(inward.contact_id),
        material_type: inward.material_type,
        brand: inward.brand || '',
        model: inward.model || '',
        serial_no: inward.serial_no || '',
        passwords: inward.passwords || '',
        photo_url: inward.photo_url || '',
        observation: inward.observation || '',
        received_date: inward.received_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('service_inwards.update', inward.id));
    };

    return (
        <Layout>
            <Head title="Edit Service Inward" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_inwards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Service Inward</h1>
                            <p className="text-muted-foreground">Update inward details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="rma">RMA <span className="text-red-500">*</span></Label>
                                <Input
                                    id="rma"
                                    value={data.rma}
                                    onChange={(e) => setData('rma', e.target.value)}
                                    placeholder="RMA-2025-001"
                                />
                                {errors.rma && <p className="text-sm text-red-600 mt-1">{errors.rma}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact_id">Contact <span className="text-red-500">*</span></Label>
                                <Select value={data.contact_id} onValueChange={(v) => setData('contact_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select contact" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name} {c.company && `- ${c.company}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.contact_id && <p className="text-sm text-red-600 mt-1">{errors.contact_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="material_type">Material Type <span className="text-red-500">*</span></Label>
                                <Select value={data.material_type} onValueChange={(v) => setData('material_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="laptop">Laptop</SelectItem>
                                        <SelectItem value="desktop">Desktop</SelectItem>
                                        <SelectItem value="printer">Printer</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.material_type && <p className="text-sm text-red-600 mt-1">{errors.material_type}</p>}
                            </div>

                            <div>
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                    placeholder="Dell, HP, etc."
                                />
                            </div>

                            <div>
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    placeholder="Latitude 7420"
                                />
                            </div>

                            <div>
                                <Label htmlFor="serial_no">Serial No</Label>
                                <Input
                                    id="serial_no"
                                    value={data.serial_no}
                                    onChange={(e) => setData('serial_no', e.target.value)}
                                    placeholder="ABC123XYZ"
                                />
                                {errors.serial_no && <p className="text-sm text-red-600 mt-1">{errors.serial_no}</p>}
                            </div>

                            <div>
                                <Label htmlFor="received_date">Received Date</Label>
                                <Input
                                    id="received_date"
                                    type="date"
                                    value={data.received_date}
                                    onChange={(e) => setData('received_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="photo_url">Photo URL</Label>
                                <Input
                                    id="photo_url"
                                    value={data.photo_url}
                                    onChange={(e) => setData('photo_url', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="passwords">Passwords / Access Info</Label>
                            <Textarea
                                id="passwords"
                                value={data.passwords}
                                onChange={(e) => setData('passwords', e.target.value)}
                                placeholder="BIOS: 1234, Windows: pass@123"
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="observation">Observation / Issue Description</Label>
                            <Textarea
                                id="observation"
                                value={data.observation}
                                onChange={(e) => setData('observation', e.target.value)}
                                placeholder="Device not powering on..."
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('service_inwards.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Inward'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
