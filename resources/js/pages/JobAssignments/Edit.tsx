// resources/js/Pages/JobAssignments/Edit.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
    id: number;
    job_card: { job_no: string; service_inward: { rma: string; contact: { name: string } } };
    user: { id: number; name: string };
    status: { id: number; name: string };
    started_at: string | null;
    completed_at: string | null;
    time_spent_minutes: number;
    report: string | null;
    remarks: string | null;
    stage: string | null; // ← ADD
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
    assignment: Assignment;
    users: UserOption[];
    statuses: StatusOption[];
}

export default function Edit() {
    const route = useRoute();
    const { assignment, users, statuses } = usePage().props as unknown as Props;

    const { data, setData, put, processing, errors } = useForm({
        user_id: String(assignment.user.id),
        service_status_id: String(assignment.status.id),
        started_at: assignment.started_at ? format(new Date(assignment.started_at), 'yyyy-MM-dd HH:mm') : '',
        completed_at: assignment.completed_at ? format(new Date(assignment.completed_at), 'yyyy-MM-dd HH:mm') : '',
        time_spent_minutes: String(assignment.time_spent_minutes),
        report: assignment.report || '',
        remarks: assignment.remarks || '',
        stage: assignment.stage || '',
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
        put(route('job_assignments.update', assignment.id));
    };

    return (
        <Layout>
            <Head title="Edit Assignment" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_assignments.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Job Assignment</h1>
                            <p className="text-muted-foreground">Update technician progress</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Job Card</Label>
                                <Input
                                    value={`${assignment.job_card.job_no} – ${assignment.job_card.service_inward.rma} (${assignment.job_card.service_inward.contact.name})`}
                                    disabled
                                />
                            </div>

                            <div>
                                <Label htmlFor="user_id">
                                    Technician <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                    Current Status <span className="text-red-500">*</span>
                                </Label>
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

                            <div>
                                <Label htmlFor="started_at">Started At</Label>
                                <Input
                                    id="started_at"
                                    type="datetime-local"
                                    value={data.started_at}
                                    onChange={(e) => setData('started_at', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="completed_at">Completed At</Label>
                                <Input
                                    id="completed_at"
                                    type="datetime-local"
                                    value={data.completed_at}
                                    onChange={(e) => setData('completed_at', e.target.value)}
                                />
                                {errors.completed_at && <p className="text-sm text-red-600 mt-1">{errors.completed_at}</p>}
                            </div>

                            <div>
                                <Label htmlFor="time_spent_minutes">Time Spent (minutes)</Label>
                                <Input
                                    id="time_spent_minutes"
                                    type="number"
                                    min="0"
                                    value={data.time_spent_minutes}
                                    onChange={(e) => setData('time_spent_minutes', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="report">Technician Report</Label>
                                <Textarea
                                    id="report"
                                    value={data.report}
                                    onChange={(e) => setData('report', e.target.value)}
                                    placeholder="What was done..."
                                    rows={4}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('job_assignments.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Assignment'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
