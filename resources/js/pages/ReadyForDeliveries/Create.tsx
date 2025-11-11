// resources/js/Pages/ReadyForDeliveries/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import JobCardAutocomplete from '@/components/blocks/JobCardAutocomplete'; // ← NEW

interface JobCardOption {
    id: number;
    job_no: string;
    service_inward: {
        rma: string;
        serial_no: string | null;
    };
    contact: {
        name: string;
        mobile: string | null;
    };
}

interface UserOption {
    id: number;
    name: string;
}

interface StatusOption {
    id: number;
    name: string;
}

interface CreatePageProps {
    jobCards: JobCardOption[];
    users: UserOption[];
    statuses: StatusOption[];
}

export default function Create() {
    const route = useRoute();
    const { jobCards, users, statuses } = usePage().props as unknown as CreatePageProps;

    const { data, setData, post, processing, errors } = useForm({
        job_card_id: '',
        user_id: '',
        engineer_note: '',
        future_note: '',
        billing_details: '',
        billing_amount: '',
        service_status_id: '',
        delivered_otp: '',
    });

    const [selectedJobCard, setSelectedJobCard] = React.useState<JobCardOption | null>(null);

    const handleJobCardSelect = (job: JobCardOption | null) => {
        setSelectedJobCard(job);
        setData('job_card_id', job ? String(job.id) : '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('ready_for_deliveries.store'));
    };

    return (
        <Layout>
            <Head title="Create Ready for Delivery" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('ready_for_deliveries.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">New Ready for Delivery</h1>
                            <p className="text-muted-foreground">
                                Mark job as ready for customer pickup
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* JOB CARD (AUTOCOMPLETE) */}
                            <div>
                                <Label htmlFor="job-autocomplete">
                                    Job Card <span className="text-red-500">*</span>
                                </Label>
                                <JobCardAutocomplete
                                    value={selectedJobCard}
                                    onSelect={handleJobCardSelect}
                                    placeholder="Search by Job No, RMA, Customer..."
                                />
                                {errors.job_card_id && (
                                    <p className="text-sm text-red-600 mt-1">{errors.job_card_id}</p>
                                )}
                            </div>

                            {/* ENGINEER */}
                            <div>
                                <Label htmlFor="user_id">
                                    Engineer <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select engineer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.user_id && (
                                    <p className="text-sm text-red-600 mt-1">{errors.user_id}</p>
                                )}
                            </div>

                            {/* SERVICE STATUS */}
                            <div>
                                <Label htmlFor="service_status_id">
                                    Service Status <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.service_status_id}
                                    onValueChange={(v) => setData('service_status_id', v)}
                                >
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
                                {errors.service_status_id && (
                                    <p className="text-sm text-red-600 mt-1">{errors.service_status_id}</p>
                                )}
                            </div>

                            {/* BILLING AMOUNT */}
                            <div>
                                <Label htmlFor="billing_amount">
                                    Billing Amount <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="billing_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.billing_amount}
                                    onChange={(e) => setData('billing_amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.billing_amount && (
                                    <p className="text-sm text-red-600 mt-1">{errors.billing_amount}</p>
                                )}
                            </div>
                        </div>

                        {/* ENGINEER NOTE */}
                        <div>
                            <Label htmlFor="engineer_note">Engineer Note</Label>
                            <Textarea
                                id="engineer_note"
                                value={data.engineer_note}
                                onChange={(e) => setData('engineer_note', e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* FUTURE NOTE */}
                        <div>
                            <Label htmlFor="future_note">Future Reference Note</Label>
                            <Textarea
                                id="future_note"
                                value={data.future_note}
                                onChange={(e) => setData('future_note', e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* BILLING DETAILS */}
                        <div>
                            <Label htmlFor="billing_details">Billing Details</Label>
                            <Textarea
                                id="billing_details"
                                value={data.billing_details}
                                onChange={(e) => setData('billing_details', e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* OTP */}
                        <div className="md:w-1/3">
                            <Label htmlFor="delivered_otp">Delivery OTP (Optional)</Label>
                            <Input
                                id="delivered_otp"
                                value={data.delivered_otp}
                                onChange={(e) => setData('delivered_otp', e.target.value)}
                                maxLength={6}
                                placeholder="123456"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('ready_for_deliveries.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Mark as Ready'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
