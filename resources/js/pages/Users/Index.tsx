import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Search, Trash } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Role {
    name: string;
    label: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
    roles: { name: string }[];
    deleted_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersPageProps {
    users: {
        data: User[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
        per_page?: string;
    };
    roles: Role[];
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function Index() {
    const { users, filters, roles, can, trashedCount } =
        usePage<UsersPageProps>().props;
    const route = useRoute();

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all'); // ← use 'all'
    const [perPage, setPerPage] = useState(filters.per_page || '25');

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (perPage) params.per_page = perPage;

        router.get(route('users.index'), params, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Move user to trash?')) return;
        router.delete(route('users.destroy', id), { preserveScroll: true });
    };

    return (
        <Layout>
            <Head title="Users" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                            <p className="text-muted-foreground">
                                Manage system users and roles
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {can.create && (
                                <Button asChild>
                                    <Link href={route('users.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New User
                                    </Link>
                                </Button>
                            )}
                            {trashedCount > 0 && (
                                <Button variant="outline" asChild>
                                    <Link href={route('users.trash')}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Trash ({trashedCount})
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="pl-10"
                            />
                        </div>

                        {/* Role filter */}
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.name} value={role.name}>
                                        {role.label || role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Per-page */}
                        <Select value={perPage} onValueChange={setPerPage}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={applyFilters} size="sm" className="w-full md:w-auto">
                        Apply Filters
                    </Button>

                    {/* Users Grid */}
                    {users.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                <p className="text-muted-foreground">No users found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {users.data.map((user) => (
                                <Card
                                    key={user.id}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {user.name}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={user.active ? 'default' : 'secondary'}
                                            >
                                                {user.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {user.roles.map((r) => (
                                                <Badge
                                                    key={r.name}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {r.name}
                                                </Badge>
                                            ))}
                                            {user.roles.length === 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    No roles
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={route('users.edit', user.id)}>
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            {can.delete && !user.deleted_at && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <nav className="flex justify-center gap-1 mt-8">
                            {users.links.map((link, i) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={i}
                                            className="px-3 py-1.5 text-sm text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
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
                </div>
            </div>
        </Layout>
    );
}
