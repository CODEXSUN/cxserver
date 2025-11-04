// resources/js/Pages/Contacts/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    Trash2,
    Edit,
    MoreHorizontal,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    has_web_access: boolean;
    active: boolean;
    deleted_at: string | null;
    contact_type: {
        id: number;
        name: string;
    };
}

interface ContactType {
    id: number;
    name: string;
}

interface ContactsPageProps extends InertiaPageProps {
    contacts: {
        data: Contact[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    contactTypes: ContactType[];
    filters: {
        contact_type_id?: number;
        page?: number;
    };
    can: {
        create: boolean;
        delete: boolean;
    };
    trashedCount: number;
}

export default function Index() {
    const { contacts, contactTypes, filters, can, trashedCount } = usePage<ContactsPageProps>().props;
    const route = useRoute();

    const currentPage = contacts.current_page;
    const lastPage = contacts.last_page;
    const selectedTypeId = filters.contact_type_id;

    const goToPage = (page: number) => {
        router.get(
            route('contacts.index'),
            { page, contact_type_id: selectedTypeId },
            { preserveState: true, replace: true }
        );
    };

    const changeContactType = (value: string) => {
        const typeId = value === 'all' ? undefined : Number(value);
        router.get(
            route('contacts.index'),
            { contact_type_id: typeId, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Move to trash?')) {
            router.delete(route('contacts.destroy', id), { preserveScroll: true });
        }
    };

    const handleRestore = (id: number) => {
        router.post(route('contacts.restore', id), {}, { preserveScroll: true });
    };

    const handleForceDelete = (id: number) => {
        if (confirm('Delete permanently?')) {
            router.delete(route('contacts.forceDelete', id), { preserveScroll: true });
        }
    };

    return (
        <Layout>
            <Head title="Contacts" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>All Contacts</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Showing {contacts.from} to {contacts.to} of {contacts.total} results
                            </p>
                        </CardHeader>
                        <CardContent>
                            {contacts.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        {selectedTypeId ? 'No contacts in this type.' : 'No contacts yet.'}
                                    </p>
                                    {can.create && (
                                        <Button asChild className="mt-4">
                                            <Link href={route('contacts.create')}>
                                                <Plus className="mr-2 h-4 w-4" /> Create First Contact
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-md border">
                                        <Table>
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
                                                                <Link
                                                                    href={route('contacts.edit', contact.id)}
                                                                    className="hover:text-primary transition-colors"
                                                                >
                                                                    {contact.name}
                                                                </Link>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{contact.mobile}</TableCell>
                                                        <TableCell>{contact.email || <span className="text-muted-foreground">—</span>}</TableCell>
                                                        <TableCell>{contact.company || <span className="text-muted-foreground">—</span>}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{contact.contact_type.name}</Badge>
                                                        </TableCell>
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
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Actions</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    {!contact.deleted_at ? (
                                                                        <>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('contacts.edit', contact.id)}>
                                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            {can.delete && (
                                                                                <DropdownMenuItem
                                                                                    className="text-destructive"
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault();
                                                                                        handleDelete(contact.id);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onSelect={(e) => {
                                                                                    e.preventDefault();
                                                                                    handleRestore(contact.id);
                                                                                }}
                                                                            >
                                                                                <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onSelect={(e) => {
                                                                                    e.preventDefault();
                                                                                    handleForceDelete(contact.id);
                                                                                }}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-muted-foreground">
                                            Page {currentPage} of {lastPage}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => goToPage(1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => goToPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => goToPage(currentPage + 1)}
                                                disabled={currentPage === lastPage}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => goToPage(lastPage)}
                                                disabled={currentPage === lastPage}
                                            >
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
