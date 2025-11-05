// resources/js/Pages/JobCards/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Search } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface JobCard {
    id: number;
    job_no: string;
    final_status: string | null;
    spares_applied: string | null;
    service_inward: { rma: string; contact: { name: string } };
    status: { name: string };
    deleted_at: string | null;
}

interface Props {
    jobs: {
        data: JobCard[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: { search?: string };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { jobs, filters, can, trashedCount } = usePage().props as unknown as Props;
    const route = useRoute();

    const handleSearch = (value: string) => {
        router.get(
            route('job_cards.index'),
            { search: value || undefined, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    return (
        <Layout>
            <Head title="Job Cards" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Job Cards</h1>
                            <p className="text-muted-foreground mt-1">Manage service jobs</p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild>
                                                <Link href={route('job_cards.create')}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    New Job Card
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Add a new job card</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('job_cards.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Search */}
                    <div className="flex gap-4 items-center max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by Job No, RMA, or Customer..."
                                className="pl-10"
                                defaultValue={filters.search || ''}
                                onKeyUp={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleSearch(document.querySelector('input')?.value || '')}>
                            Search
                        </Button>
                    </div>

                    <DataTable
                        title="All Job Cards"
                        data={jobs.data}
                        pagination={jobs}
                        routeName="job_cards.index"
                        queryParams={{ search: filters.search }}
                        emptyMessage="No job cards found."
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead className="bg-muted/50">Job No</TableHead>
                                <TableHead className="bg-muted/50">Inward</TableHead>
                                <TableHead className="bg-muted/50">Customer</TableHead>
                                <TableHead className="bg-muted/50">Status</TableHead>
                                <TableHead className="bg-muted/50 text-center">Spares?</TableHead>
                                <TableHead className="bg-muted/50">Final Status</TableHead>
                                <TableHead className="bg-muted/50 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.data.map((job) => (
                                <TableRow key={job.id} className={job.deleted_at ? 'opacity-60' : ''}>
                                    <TableCell className="font-medium">
                                        {job.deleted_at ? (
                                            <span className="text-muted-foreground">{job.job_no}</span>
                                        ) : (
                                            <Link href={route('job_cards.show', job.id)} className="hover:text-primary">
                                                {job.job_no}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>{job.service_inward.rma}</TableCell>
                                    <TableCell>{job.service_inward.contact.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{job.status.name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={job.spares_applied && job.spares_applied !== 'No' ? "default" : "secondary"}
                                            className={job.spares_applied && job.spares_applied !== 'No' ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                                        >
                                            {job.spares_applied || 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                job.final_status === 'Completed' || job.final_status === 'Delivered'
                                                    ? "default"
                                                    : job.final_status === 'Cancelled'
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {job.final_status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={job.id}
                                            editRoute={route('job_cards.edit', job.id)}
                                            deleteRoute={route('job_cards.destroy', job.id)}
                                            restoreRoute={job.deleted_at ? route('job_cards.restore', job.id) : undefined}
                                            forceDeleteRoute={job.deleted_at ? route('job_cards.forceDelete', job.id) : undefined}
                                            isDeleted={!!job.deleted_at}
                                            canDelete={can.delete}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </DataTable>
                </div>
            </div>
        </Layout>
    );
}
