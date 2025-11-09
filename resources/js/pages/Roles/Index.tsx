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

interface Permission {
    id: number;
    name: string;
    label: string;
}

interface Role {
    id: number;
    name: string;
    label: string;
    description: string | null;
    permissions: Permission[];
    deleted_at: string | null;
}

interface RolesPageProps extends InertiaPageProps {
    roles: {
        data: Role[];
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
    const { roles, filters, can, trashedCount } = usePage<RolesPageProps>().props;
    const route = useRoute();

    const handleDelete = (id: number) => {
        if (!confirm('Move this role to trash?')) return;
        router.delete(route('roles.destroy', id), { preserveScroll: true });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        router.get(route('roles.index'), { search, per_page: filters.per_page }, { preserveState: true });
    };

    return (
        <Layout>
            <Head title="Roles" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                            <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
                        </div>

                        <div className="flex gap-3">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('roles.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Role
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('roles.trash')}>
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
                            placeholder="Search roles..."
                            className="pl-10"
                            defaultValue={filters.search}
                            onChange={handleSearch}
                        />
                    </div>

                    <Separator />

                    {/* Empty State */}
                    {roles.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <Trash2 className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-medium">No roles found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {filters.search ? 'Try adjusting your search.' : 'Create your first role.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {roles.data.map((role) => (
                                    <Card key={role.id} className={role.deleted_at ? 'opacity-60' : ''}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{role.label}</CardTitle>
                                                {role.deleted_at && <Badge variant="secondary">Trashed</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{role.name}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {role.permissions.length > 0 ? (
                                                    role.permissions.map((perm) => (
                                                        <Badge key={perm.id} variant="outline" className="text-xs">
                                                            {perm.label}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No permissions</span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={route('roles.show', role.id)}>
                                                        View
                                                    </Link>
                                                </Button>

                                                {!role.deleted_at && (
                                                    <>
                                                        <Button size="sm" variant="ghost" asChild>
                                                            <Link href={route('roles.edit', role.id)}>
                                                                <Edit className="mr-1 h-3.5 w-3.5" />
                                                                Edit
                                                            </Link>
                                                        </Button>

                                                        {can.delete && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(role.id)}
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
                            {roles.links && roles.links.length > 3 && (
                                <nav className="flex items-center justify-center gap-1 mt-8">
                                    {roles.links.map((link, idx) => {
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
