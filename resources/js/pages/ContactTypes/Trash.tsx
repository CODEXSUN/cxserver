// resources/js/Pages/ContactTypes/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState } from 'react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

import { Button } from '@/components/ui/button';
import { Card, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface ContactType {
    id: number;
    name: string;
    description: string | null;
    contacts_count: number;
    deleted_at: string;
}

interface TrashPageProps extends InertiaPageProps {
    contactTypes: {
        data: ContactType[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function Trash() {
    const { contactTypes } = usePage<TrashPageProps>().props;
    const route = useRoute();
    const [processing, setProcessing] = useState<number | null>(null);

    return (
        <Layout>
            <Head title="Trashed Contact Types" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Contact Types</h1>
                            <p className="text-muted-foreground mt-1">
                                {contactTypes.total} type{contactTypes.total !== 1 ? 's' : ''} in trash
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('contact-types.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    {contactTypes.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                                <p className="text-muted-foreground">No contact types in trash.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <DataTable
                            title="Trashed Contact Types"
                            data={contactTypes.data}
                            pagination={contactTypes}
                            routeName="contact-types.trash"
                            emptyMessage="No contact types in trash."
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contacts</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contactTypes.data.map((type) => (
                                    <TableRow key={type.id} className="opacity-60">
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell><Badge variant="outline">{type.contacts_count}</Badge></TableCell>
                                        <TableCell>{new Date(type.deleted_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setProcessing(type.id);
                                                        router.post(route('contact-types.restore', type.id), {}, {
                                                            preserveScroll: true,
                                                            onFinish: () => setProcessing(null),
                                                        });
                                                    }}
                                                    disabled={processing === type.id}
                                                >
                                                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                    {processing === type.id ? 'Restoring...' : 'Restore'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (confirm('Delete permanently?')) {
                                                            setProcessing(type.id);
                                                            router.delete(route('contact-types.forceDelete', type.id), {
                                                                preserveScroll: true,
                                                                onFinish: () => setProcessing(null),
                                                            });
                                                        }
                                                    }}
                                                    disabled={processing === type.id}
                                                >
                                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                    {processing === type.id ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </DataTable>
                    )}
                </div>
            </div>
        </Layout>
    );
}
