// resources/js/Pages/Contacts/Trash.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState } from 'react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Contact {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    company: string | null;
    contact_type: { id: number; name: string };
    deleted_at: string;
}

interface TrashPageProps extends InertiaPageProps {
    contacts: {
        data: Contact[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function Trash() {
    const { contacts } = usePage<TrashPageProps>().props;
    const route = useRoute();
    const [processing, setProcessing] = useState<number | null>(null);

    return (
        <Layout>
            <Head title="Trashed Contacts" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Trashed Contacts</h1>
                            <p className="text-muted-foreground mt-1">
                                {contacts.total} contact{contacts.total !== 1 ? 's' : ''} in trash
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('contacts.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    {contacts.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                                <p className="text-muted-foreground">No contacts in trash.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <DataTable
                            title="Trashed Contacts"
                            data={contacts.data}
                            pagination={contacts}
                            routeName="contacts.trash"
                            emptyMessage="No contacts in trash."
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Deleted At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.data.map((contact) => (
                                    <TableRow key={contact.id} className="opacity-60">
                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                        <TableCell>{contact.mobile}</TableCell>
                                        <TableCell><Badge variant="outline">{contact.contact_type.name}</Badge></TableCell>
                                        <TableCell>{new Date(contact.deleted_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setProcessing(contact.id);
                                                        router.post(route('contacts.restore', contact.id), {}, {
                                                            preserveScroll: true,
                                                            onFinish: () => setProcessing(null),
                                                        });
                                                    }}
                                                    disabled={processing === contact.id}
                                                >
                                                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                    {processing === contact.id ? 'Restoring...' : 'Restore'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (confirm('Delete permanently?')) {
                                                            setProcessing(contact.id);
                                                            router.delete(route('contacts.forceDelete', contact.id), {
                                                                preserveScroll: true,
                                                                onFinish: () => setProcessing(null),
                                                            });
                                                        }
                                                    }}
                                                    disabled={processing === contact.id}
                                                >
                                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                                    {processing === contact.id ? 'Deleting...' : 'Delete'}
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
