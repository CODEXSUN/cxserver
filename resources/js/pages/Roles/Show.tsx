import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    label: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
    label: string;
    description: string | null;
    permissions: Permission[];
    users: User[];
    created_at: string;
    updated_at: string;
}

interface ShowPageProps {
    role: Role;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function Show() {
    const { role, can } = usePage<ShowPageProps>().props;
    const route = useRoute();

    const handleDelete = () => {
        if (!confirm('Move this role to trash?')) return;
        router.delete(route('roles.destroy', role.id), { preserveScroll: true });
    };

    return (
        <Layout>
            <Head title={role.label} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('roles.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                All Roles
                            </Link>
                        </Button>

                        <div className="flex gap-2">
                            {can.edit && (
                                <Button size="sm" variant="secondary" asChild>
                                    <Link href={route('roles.edit', role.id)}>
                                        <Edit className="mr-1 h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            {can.delete && (
                                <Button size="sm" variant="destructive" onClick={handleDelete}>
                                    <Trash className="mr-1 h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{role.label}</CardTitle>
                                    <p className="text-muted-foreground">{role.name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {role.description && (
                                <div>
                                    <strong>Description:</strong>
                                    <p className="mt-1 text-muted-foreground">{role.description}</p>
                                </div>
                            )}

                            <div>
                                <strong>Permissions:</strong>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {role.permissions.length > 0 ? (
                                        role.permissions.map((perm) => (
                                            <Badge key={perm.id} variant="outline">
                                                {perm.label}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground">None</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong>Assigned Users:</strong>
                                <div className="mt-2">
                                    {role.users.length > 0 ? (
                                        <ul className="space-y-1">
                                            {role.users.map((user) => (
                                                <li key={user.id} className="text-sm">
                                                    {user.name} ({user.email})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-muted-foreground">No users assigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Created: {new Date(role.created_at).toLocaleDateString()} •
                                Updated: {new Date(role.updated_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
