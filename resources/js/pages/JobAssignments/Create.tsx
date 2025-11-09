// resources/js/Pages/JobAssignments/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface JobCardOption {
    id: number;
    job_no: string;
    service_inward: { rma: string; contact: { name: string } };
}

interface UserOption {
    id: number;
    name: string;
}

interface StatusOption {
    id: number;
    name: string;
}

interface Props {
    jobCards: JobCardOption[];
    users: UserOption[];
    statuses: StatusOption[];
}


export default function Create() {
    const route = useRoute();
    const { jobCards, users, statuses } = usePage().props as unknown as Props;

    const { data, setData, post, processing, errors } = useForm({
        job_card_id: '',
        user_id: '',
        service_status_id: '',
        stage: '', // ← ADD
        remarks: '',
    });

    const stageOptions = [
        'New Case',
        'Repeted',
        'Free Service',
        'From Out Service',
        'Retaken',
        'Swap Engineer',
    ];


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('job_assignments.store'));
    };

    return (
        <Layout>
            <Head title="Assign Job" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_assignments.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Assign Job to Technician</h1>
                            <p className="text-muted-foreground">Assign a job card to a technician</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="job_card_id">
                                    Job Card <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.job_card_id} onValueChange={(v) => setData('job_card_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job card" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobCards.map((jc) => (
                                            <SelectItem key={jc.id} value={String(jc.id)}>
                                                {jc.job_no} – {jc.service_inward.rma} ({jc.service_inward.contact.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.job_card_id && <p className="text-sm text-red-600 mt-1">{errors.job_card_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="user_id">
                                    Technician <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select technician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.user_id && <p className="text-sm text-red-600 mt-1">{errors.user_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="service_status_id">
                                    Initial Status <span className="text-red-500">*</span>
                                </Label>
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

                            {/* Add Stage Field */}
                            <div>
                                <Label htmlFor="stage">Stage</Label>
                                <Select value={data.stage} onValueChange={(v) => setData('stage', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stageOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="remarks">Remarks (Optional)</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Any special instructions..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('job_assignments.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Assigning...' : 'Assign Job'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
