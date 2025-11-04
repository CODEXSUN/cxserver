// resources/js/Pages/ContactTypes/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface ContactType {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    deleted_at: string | null;
    contacts_count: number;
}

interface ContactTypesPageProps {
    contactTypes: {
        data: ContactType[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { contactTypes, can, trashedCount } = usePage()
        .props as unknown as ContactTypesPageProps;
    const route = useRoute();

    return (
        <Layout>
            <Head title="Contact Types" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Contact Types</h1>
                            <p className="text-muted-foreground mt-1">Manage contact categories</p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('contact-types.create')}>
                                        <Plus className="mr-2 h-4 w-4" /> New Type
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('contact-types.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <DataTable
                        title="All Contact Types"
                        data={contactTypes.data}
                        pagination={contactTypes}
                        routeName="contact-types.index"
                        emptyMessage="No contact types yet."
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Contacts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contactTypes.data.map((type) => (
                                <TableRow key={type.id} className={type.deleted_at ? 'opacity-60' : ''}>
                                    <TableCell className="font-medium">
                                        {type.deleted_at ? (
                                            <span className="text-muted-foreground">{type.name}</span>
                                        ) : (
                                            <Link href={route('contact-types.edit', type.id)} className="hover:text-primary">
                                                {type.name}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {type.description || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={type.is_active ? 'default' : 'secondary'}>
                                            {type.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{type.contacts_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={type.id}
                                            editRoute={route('contact-types.edit', type.id)}
                                            deleteRoute={route('contact-types.destroy', type.id)}
                                            restoreRoute={type.deleted_at ? route('contact-types.restore', type.id) : undefined}
                                            forceDeleteRoute={type.deleted_at ? route('contact-types.forceDelete', type.id) : undefined}
                                            isDeleted={!!type.deleted_at}
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
