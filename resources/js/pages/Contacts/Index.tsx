// resources/js/Pages/Contacts/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import TableActions from '@/components/table/TableActions';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Contact {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    company: string | null;
    has_web_access: boolean;
    active: boolean;
    deleted_at: string | null;
    contact_type: { id: number; name: string };
}

interface ContactsPageProps {
    contacts: {
        data: Contact[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    contactTypes: { id: number; name: string }[];
    filters: { contact_type_id?: number; page?: number };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

export default function Index() {
    const { contacts, contactTypes, filters, can, trashedCount } = usePage()
        .props as unknown as ContactsPageProps;
    const route = useRoute();

    const selectedTypeId = filters.contact_type_id;

    const changeContactType = (value: string) => {
        const typeId = value === 'all' ? undefined : Number(value);
        router.get(route('contacts.index'), { contact_type_id: typeId, page: 1 }, { preserveState: true, replace: true });
    };

    return (
        <Layout>
            <Head title="Contacts" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                            <p className="text-muted-foreground mt-1">Manage your contacts</p>
                        </div>
                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('contacts.create')}>
                                        <Plus className="mr-2 h-4 w-4" /> New Contact
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('contacts.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="max-w-xs">
                        <Select value={selectedTypeId ? String(selectedTypeId) : 'all'} onValueChange={changeContactType}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {contactTypes.map((type) => (
                                    <SelectItem key={type.id} value={String(type.id)}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DataTable
                        title="All Contacts"
                        data={contacts.data}
                        pagination={contacts}
                        routeName="contacts.index"
                        queryParams={{ contact_type_id: selectedTypeId }}
                        emptyMessage={selectedTypeId ? 'No contacts in this type.' : 'No contacts yet.'}
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Web</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.data.map((contact) => (
                                <TableRow key={contact.id} className={contact.deleted_at ? 'opacity-60' : ''}>
                                    <TableCell className="font-medium">
                                        {contact.deleted_at ? (
                                            <span className="text-muted-foreground">{contact.name}</span>
                                        ) : (
                                            <Link href={route('contacts.edit', contact.id)} className="hover:text-primary">
                                                {contact.name}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>{contact.mobile}</TableCell>
                                    <TableCell>{contact.email || <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell>{contact.company || <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell><Badge variant="outline">{contact.contact_type.name}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={contact.active ? 'default' : 'secondary'}>
                                            {contact.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={contact.has_web_access ? 'default' : 'secondary'}>
                                            {contact.has_web_access ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TableActions
                                            id={contact.id}
                                            editRoute={route('contacts.edit', contact.id)}
                                            deleteRoute={route('contacts.destroy', contact.id)}
                                            restoreRoute={contact.deleted_at ? route('contacts.restore', contact.id) : undefined}
                                            forceDeleteRoute={contact.deleted_at ? route('contacts.forceDelete', contact.id) : undefined}
                                            isDeleted={!!contact.deleted_at}
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
