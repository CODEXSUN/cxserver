// resources/js/Pages/ReadyForDeliveries/Edit.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

interface Delivery {
    id: number;
    job_card: {
        job_no: string;
        service_inward: { rma: string };
        contact: { name: string; mobile?: string | null };
    };
    user: { id: number; name: string } | null;
    service_status: { id: number; name: string };
    engineer_note: string | null;
    future_note: string | null;
    billing_details: string | null;
    billing_amount: string;
    delivered_otp: string | null;
    delivered_confirmed_at: string | null;
}

interface UserOption {
    id: number;
    name: string;
}

interface StatusOption {
    id: number;
    name: string;
}

interface EditPageProps {
    delivery: Delivery;
    users: UserOption[];
    statuses: StatusOption[];
}

export default function Edit() {
    const route = useRoute();
    const { delivery, users, statuses } = usePage<EditPageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        user_id: delivery.user ? String(delivery.user.id) : '',
        service_status_id: String(delivery.service_status.id),
        engineer_note: delivery.engineer_note || '',
        future_note: delivery.future_note || '',
        billing_details: delivery.billing_details || '',
        billing_amount: delivery.billing_amount || '0',
        delivered_otp: delivery.delivered_otp || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ready_for_deliveries.update', delivery.id));
    };

    return (
        <Layout>
            <Head title={`Edit Delivery - ${delivery.job_card.job_no}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={route('ready_for_deliveries.index')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Edit Ready for Delivery
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Job: <span className="font-medium">{delivery.job_card.job_no}</span> | RMA:{' '}
                                    <span className="font-medium">{delivery.job_card.service_inward.rma}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Form Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Job Card Info (Read-only) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Job Card</Label>
                                        <p className="font-medium">{delivery.job_card.job_no}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Customer</Label>
                                        <p className="font-medium">{delivery.job_card.contact.name}</p>
                                        {delivery.job_card.contact.mobile && (
                                            <p className="text-sm text-muted-foreground">
                                                {delivery.job_card.contact.mobile}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">RMA</Label>
                                        <p className="font-medium">{delivery.job_card.service_inward.rma}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Current Engineer</Label>
                                        <p className="font-medium">
                                            {delivery.user?.name || (
                                                <span className="text-muted-foreground italic">Not assigned</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="user_id">Assign Engineer *</Label>
                                        <Select
                                            value={data.user_id}
                                            onValueChange={(v) => setData('user_id', v)}
                                        >
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
                                            <p className="text-sm text-destructive mt-1">{errors.user_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="service_status_id">Service Status *</Label>
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
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.service_status_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="billing_amount">Billing Amount (₹) *</Label>
                                        <Input
                                            id="billing_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.billing_amount}
                                            onChange={(e) => setData('billing_amount', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        {errors.billing_amount && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.billing_amount}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="delivered_otp">Delivery OTP</Label>
                                        <Input
                                            id="delivered_otp"
                                            value={data.delivered_otp}
                                            onChange={(e) => setData('delivered_otp', e.target.value)}
                                            maxLength={6}
                                            placeholder="123456"
                                        />
                                        {errors.delivered_otp && (
                                            <p className="text-sm text-destructive mt-1">
                                                {errors.delivered_otp}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="engineer_note">Engineer Note</Label>
                                        <Textarea
                                            id="engineer_note"
                                            value={data.engineer_note}
                                            onChange={(e) => setData('engineer_note', e.target.value)}
                                            rows={3}
                                            placeholder="Technical details, repairs done..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="future_note">Future Note</Label>
                                        <Textarea
                                            id="future_note"
                                            value={data.future_note}
                                            onChange={(e) => setData('future_note', e.target.value)}
                                            rows={3}
                                            placeholder="Follow-up, warranty, reminders..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="billing_details">Billing Details</Label>
                                        <Textarea
                                            id="billing_details"
                                            value={data.billing_details}
                                            onChange={(e) => setData('billing_details', e.target.value)}
                                            rows={3}
                                            placeholder="Parts, labor, taxes..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('ready_for_deliveries.index')}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Delivery'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
