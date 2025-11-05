// resources/js/Pages/JobCards/Show.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface JobCard {
    id: number;
    job_no: string;
    final_status: string | null;
    spares_applied: string | null;
    diagnosis: string | null;
    estimated_cost: string | null;
    advance_paid: string | null;
    final_bill: string | null;
    delivered_at: string | null;
    service_inward: { rma: string; contact: { name: string; company: string | null; mobile: string } };
    status: { name: string };
    receiver: { name: string } | null;
}

interface Props {
    job: JobCard;
    can: { edit: boolean; delete: boolean };
}

export default function Show() {
    const route = useRoute();
    const { job, can } = usePage().props as unknown as Props;

    return (
        <Layout>
            <Head title={`Job ${job.job_no}`} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('job_cards.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        {can.edit && (
                            <Button asChild size="sm">
                                <Link href={route('job_cards.edit', job.id)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">{job.job_no}</h1>
                                <p className="text-muted-foreground">Inward: {job.service_inward.rma}</p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                                {job.status.name}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Customer</h3>
                                <p className="font-medium">{job.service_inward.contact.name}</p>
                                {job.service_inward.contact.company && <p className="text-muted-foreground">{job.service_inward.contact.company}</p>}
                                <p className="text-sm">{job.service_inward.contact.mobile}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Financials</h3>
                                <p>Estimated: <strong>${job.estimated_cost || '—'}</strong></p>
                                <p>Advance: <strong>${job.advance_paid || '0'}</strong></p>
                                <p>Final Bill: <strong>${job.final_bill || '—'}</strong></p>
                            </div>
                        </div>

                        {job.diagnosis && (
                            <div>
                                <h3 className="font-semibold mb-2">Diagnosis</h3>
                                <p className="whitespace-pre-wrap">{job.diagnosis}</p>
                            </div>
                        )}

                        <div className="flex gap-6">
                            <div>
                                <span className="font-medium">Spares Applied:</span>{' '}
                                <Badge variant={job.spares_applied && job.spares_applied !== 'No' ? "default" : "secondary"}
                                       className={job.spares_applied && job.spares_applied !== 'No' ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                                    {job.spares_applied || 'No'}
                                </Badge>
                            </div>
                            <div>
                                <span className="font-medium">Final Status:</span>{' '}
                                <Badge variant={
                                    job.final_status === 'Completed' || job.final_status === 'Delivered' ? "default" :
                                        job.final_status === 'Cancelled' ? "destructive" : "secondary"
                                }>
                                    {job.final_status || 'Pending'}
                                </Badge>
                            </div>
                        </div>

                        {job.delivered_at && (
                            <div className="text-sm text-muted-foreground">
                                Delivered on: <span className="font-medium">{format(new Date(job.delivered_at), 'dd MMM yyyy')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
