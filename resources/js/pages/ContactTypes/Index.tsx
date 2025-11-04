// resources/js/Pages/ContactTypes/Index.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

interface ContactType {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    deleted_at: string | null;
    contacts_count: number;
}

interface ContactTypesPageProps extends InertiaPageProps {
    contactTypes: {
        data: ContactType[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    can: {
        create: boolean;
        delete: boolean;
    };
    trashedCount: number;
}

export default function Index() {
    const { contactTypes, can, trashedCount } = usePage<ContactTypesPageProps>().props;
    const route = useRoute();

    const currentPage = contactTypes.current_page;
    const lastPage = contactTypes.last_page;

    const goToPage = (page: number) => {
        router.get(route('contact-types.index'), { page }, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Move to trash?')) {
            router.delete(route('contact-types.destroy', id), { preserveScroll: true });
        }
    };

    const handleRestore = (id: number) => {
        router.post(route('contact-types.restore', id), {}, { preserveScroll: true });
    };

    const handleForceDelete = (id: number) => {
        if (confirm('Delete permanently?')) {
            router.delete(route('contact-types.forceDelete', id), { preserveScroll: true });
        }
    };

    return (
        <Layout>
            <Head title="Contact Types" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>All Contact Types</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Showing {contactTypes.from} to {contactTypes.to} of {contactTypes.total} results
                            </p>
                        </CardHeader>
                        <CardContent>
                            {contactTypes.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                                    <p className="text-muted-foreground">No contact types yet.</p>
                                    {can.create && (
                                        <Button asChild className="mt-4">
                                            <Link href={route('contact-types.create')}>
                                                <Plus className="mr-2 h-4 w-4" /> Create First Type
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
                                                                <Link
                                                                    href={route('contact-types.edit', type.id)}
                                                                    className="hover:text-primary transition-colors"
                                                                >
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
                                                                    {!type.deleted_at ? (
                                                                        <>
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={route('contact-types.edit', type.id)}>
                                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            {can.delete && (
                                                                                <DropdownMenuItem
                                                                                    className="text-destructive"
                                                                                    onSelect={(e) => {
                                                                                        e.preventDefault();
                                                                                        handleDelete(type.id);
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
                                                                                    handleRestore(type.id);
                                                                                }}
                                                                            >
                                                                                <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onSelect={(e) => {
                                                                                    e.preventDefault();
                                                                                    handleForceDelete(type.id);
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
