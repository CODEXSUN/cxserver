import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Trash, Search } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    label: string;
}

interface Permission {
    id: number;
    name: string;
    label: string;
    description: string | null;
    roles: Role[];
    deleted_at: string | null;
}

interface PermissionsPageProps extends InertiaPageProps {
    permissions: {
        data: Permission[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        per_page?: string;
    };
    can: {
        create: boolean;
        delete: boolean;
    };
    trashedCount: number;
}

export default function Index() {
    const { permissions, filters, can, trashedCount } = usePage<PermissionsPageProps>().props;
    const route = useRoute();

    const handleDelete = (id: number) => {
        if (!confirm('Move this permission to trash?')) return;
        router.delete(route('permissions.destroy', id), { preserveScroll: true });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        router.get(route('permissions.index'), { search, per_page: filters.per_page }, { preserveState: true });
    };

    return (
        <Layout>
            <Head title="Permissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
                            <p className="text-muted-foreground mt-1">Manage system permissions</p>
                        </div>

                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('permissions.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Permission
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('permissions.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search permissions..."
                            className="pl-10"
                            defaultValue={filters.search}
                            onChange={handleSearch}
                        />
                    </div>

                    <Separator />

                    {/* Empty State */}
                    {permissions.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <Trash2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-medium">No permissions found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {filters.search ? 'Try adjusting your search.' : 'Create your first permission.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {permissions.data.map((perm) => (
                                    <Card key={perm.id} className={perm.deleted_at ? 'opacity-60' : ''}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{perm.label}</CardTitle>
                                                {perm.deleted_at && <Badge variant="secondary">Trashed</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{perm.name}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {perm.roles.length > 0 ? (
                                                    perm.roles.map((role) => (
                                                        <Badge key={role.id} variant="outline" className="text-xs">
                                                            {role.label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No roles</span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={route('permissions.show', perm.id)}>
                                                        View
                                                    </Link>
                                                </Button>

                                                {!perm.deleted_at && (
                                                    <>
                                                        <Button size="sm" variant="ghost" asChild>
                                                            <Link href={route('permissions.edit', perm.id)}>
                                                                <Edit className="mr-1 h-3.5 w-3.5" />
                                                                Edit
                                                            </Link>
                                                        </Button>

                                                        {can.delete && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(perm.id)}
                                                            >
                                                                <Trash className="mr-1 h-3.5 w-3.5" />
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {permissions.links && permissions.links.length > 3 && (
                                <nav className="flex items-center justify-center gap-1 mt-8">
                                    {permissions.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 text-sm text-muted-foreground"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Button
                                                key={idx}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={link.url}
                                                    preserveScroll
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            </Button>
                                        );
                                    })}
                                </nav>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
