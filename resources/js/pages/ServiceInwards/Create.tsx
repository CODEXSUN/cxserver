// resources/js/Pages/ServiceInwards/Create.tsx
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

interface UserOption {
    id: number;
    name: string;
}
interface CreatePageProps {
    contacts: ContactOption[];
    users: UserOption[];
}

export default function Create() {
    const route = useRoute();
    const { data, setData, post, processing, errors } = useForm({
        rma: '',
        contact_id: '',
        material_type: '',
        brand: '',
        model: '',
        serial_no: '',
        passwords: '',
        photo_url: '',
        observation: '',
        received_by: '',
        received_date: '',
    });

    const { contacts, users } = usePage().props as unknown as CreatePageProps;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('service_inwards.store'));
    };

    return (
        <Layout>
            <Head title="Create Service Inward" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('service_inwards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">New Service Inward</h1>
                            <p className="text-muted-foreground">Register a new device for service</p>
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
                                    placeholder=""
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
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <Label htmlFor="serial_no">Serial No</Label>
                                <Input
                                    id="serial_no"
                                    value={data.serial_no}
                                    onChange={(e) => setData('serial_no', e.target.value)}
                                    placeholder=""
                                />
                                {errors.serial_no && <p className="text-sm text-red-600 mt-1">{errors.serial_no}</p>}
                            </div>

                            <div>
                                <Label htmlFor="received_by">Received By</Label>
                                <Select value={data.received_by} onValueChange={(v) => setData('received_by', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select receiver (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    placeholder=""
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
                                {processing ? 'Saving...' : 'Create Inward'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
