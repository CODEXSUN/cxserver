// resources/js/Pages/ReadyForDeliveries/Edit.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface Delivery {
    id: number;
    job_card: {
        job_no: string;
        service_inward: { rma: string };
        contact: { name: string };
    };
    user: { name: string };
    service_status: { name: string };
    engineer_note: string | null;
    future_note: string | null;
    billing_details: string | null;
    billing_amount: string;
    delivered_otp: string | null;
    delivered_confirmed_at: string | null;
}

interface UserOption { id: number; name: string }
interface StatusOption { id: number; name: string }

interface EditPageProps {
    delivery: Delivery;
    users: UserOption[];
    statuses: StatusOption[];
}

export default function Edit() {
    const route = useRoute();
    const { delivery, users, statuses } = usePage().props as unknown as EditPageProps;

    const { data, setData, put, processing, errors } = useForm({
        user_id: String(delivery.user.id),
        engineer_note: delivery.engineer_note || '',
        future_note: delivery.future_note || '',
        billing_details: delivery.billing_details || '',
        billing_amount: delivery.billing_amount,
        service_status_id: String(delivery.service_status.id),
        delivered_otp: delivery.delivered_otp || '',
        delivered_confirmed_at: delivery.delivered_confirmed_at || '',
        delivered_confirmed_by: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ready_for_deliveries.update', delivery.id));
    };

    return (
        <Layout>
            <Head title="Edit Ready for Delivery" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('ready_for_deliveries.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Ready for Delivery</h1>
                            <p className="text-muted-foreground">Update delivery details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Job Card</Label>
                                <div className="p-2 border rounded bg-gray-50">
                                    <p className="font-medium">{delivery.job_card.job_no}</p>
                                    <p className="text-sm text-muted-foreground">
                                        RMA: {delivery.job_card.service_inward.rma} | {delivery.job_card.contact.name}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="user_id">Engineer</Label>
                                <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="service_status_id">Service Status</Label>
                                <Select value={data.service_status_id} onValueChange={(v) => setData('service_status_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="billing_amount">Billing Amount</Label>
                                <Input
                                    id="billing_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.billing_amount}
                                    onChange={(e) => setData('billing_amount', e.target.value)}
                                />
                                {errors.billing_amount && <p className="text-sm text-red-600 mt-1">{errors.billing_amount}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="engineer_note">Engineer Note</Label>
                            <Textarea
                                id="engineer_note"
                                value={data.engineer_note}
                                onChange={(e) => setData('engineer_note', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="future_note">Future Note</Label>
                            <Textarea
                                id="future_note"
                                value={data.future_note}
                                onChange={(e) => setData('future_note', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="billing_details">Billing Details</Label>
                            <Textarea
                                id="billing_details"
                                value={data.billing_details}
                                onChange={(e) => setData('billing_details', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="md:w-1/3">
                            <Label htmlFor="delivered_otp">Delivery OTP</Label>
                            <Input
                                id="delivered_otp"
                                value={data.delivered_otp}
                                onChange={(e) => setData('delivered_otp', e.target.value)}
                                maxLength={6}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('ready_for_deliveries.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
