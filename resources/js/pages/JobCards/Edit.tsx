// resources/js/Pages/JobCards/Edit.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface JobCard {
    id: number;
    service_inward_id: number;
    service_status_id: number;
    diagnosis: string | null;
    estimated_cost: string | null;
    advance_paid: string | null;
    final_status: string | null;
    spares_applied: string | null;
    service_inward: { rma: string; contact: { name: string } };
    status: { name: string };
}

interface StatusOption {
    id: number;
    name: string;
}

interface Props {
    job: JobCard;
    statuses: StatusOption[];
}

export default function Edit() {
    const route = useRoute();
    const { job, statuses } = usePage().props as unknown as Props;

    const { data, setData, put, processing, errors } = useForm({
        service_status_id: String(job.service_status_id),
        diagnosis: job.diagnosis || '',
        estimated_cost: job.estimated_cost || '',
        advance_paid: job.advance_paid || '',
        final_status: job.final_status || '',
        spares_applied: job.spares_applied || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('job_cards.update', job.id));
    };

    return (
        <Layout>
            <Head title="Edit Job Card" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_cards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Job Card</h1>
                            <p className="text-muted-foreground">Update job details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Inward</Label>
                                <Input value={`${job.service_inward.rma} – ${job.service_inward.contact.name}`} disabled />
                            </div>

                            <div>
                                <Label htmlFor="service_status_id">Status <span className="text-red-500">*</span></Label>
                                <Select value={data.service_status_id} onValueChange={(v) => setData('service_status_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
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

                            {/* Same fields as Create.tsx */}
                            {/* ... diagnosis, estimated_cost, advance_paid, final_status, spares_applied ... */}

                            <div className="md:col-span-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* ... rest of fields ... */}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('job_cards.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Job Card'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
