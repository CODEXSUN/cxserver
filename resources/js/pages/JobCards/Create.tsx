// resources/js/Pages/JobCards/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface InwardOption {
    id: number;
    rma: string;
    contact: { name: string };
}

interface StatusOption {
    id: number;
    name: string;
}

interface Props {
    inwards: InwardOption[];
    statuses: StatusOption[];
}

export default function Create() {
    const route = useRoute();
    const { inwards, statuses } = usePage().props as unknown as Props;

    const { data, setData, post, processing, errors } = useForm({
        service_inward_id: '',
        service_status_id: '',
        diagnosis: '',
        estimated_cost: '',
        advance_paid: '',
        final_status: '',
        spares_applied: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('job_cards.store'));
    };

    return (
        <Layout>
            <Head title="Create Job Card" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_cards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">New Job Card</h1>
                            <p className="text-muted-foreground">Create a service job</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="service_inward_id">Service Inward <span className="text-red-500">*</span></Label>
                                <Select value={data.service_inward_id} onValueChange={(v) => setData('service_inward_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select inward" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inwards.map((i) => (
                                            <SelectItem key={i.id} value={String(i.id)}>
                                                {i.rma} – {i.contact.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.service_inward_id && <p className="text-sm text-red-600 mt-1">{errors.service_inward_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="service_status_id">Status <span className="text-red-500">*</span></Label>
                                <Select value={data.service_status_id} onValueChange={(v) => setData('service_status_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.service_status_id && <p className="text-sm text-red-600 mt-1">{errors.service_status_id}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    placeholder="Describe the issue..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="estimated_cost">Estimated Cost</Label>
                                <Input
                                    id="estimated_cost"
                                    type="number"
                                    step="0.01"
                                    value={data.estimated_cost}
                                    onChange={(e) => setData('estimated_cost', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="advance_paid">Advance Paid</Label>
                                <Input
                                    id="advance_paid"
                                    type="number"
                                    step="0.01"
                                    value={data.advance_paid}
                                    onChange={(e) => setData('advance_paid', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="final_status">Final Status</Label>
                                <Input
                                    id="final_status"
                                    value={data.final_status}
                                    onChange={(e) => setData('final_status', e.target.value)}
                                    placeholder="Completed, Cancelled, etc."
                                />
                            </div>

                            <div>
                                <Label htmlFor="spares_applied">Spares Applied</Label>
                                <Input
                                    id="spares_applied"
                                    value={data.spares_applied}
                                    onChange={(e) => setData('spares_applied', e.target.value)}
                                    placeholder="Yes, No, HDD+RAM"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('job_cards.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Job Card'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
