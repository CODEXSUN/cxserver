import Layout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash } from 'lucide-react';

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
    created_at: string;
    updated_at: string;
}

interface ShowPageProps {
    permission: Permission;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function Show() {
    const { permission, can } = usePage<ShowPageProps>().props;
    const route = useRoute();

    const handleDelete = () => {
        if (!confirm('Move this permission to trash?')) return;
        router.delete(route('permissions.destroy', permission.id), { preserveScroll: true });
    };

    return (
        <Layout>
            <Head title={permission.label} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('permissions.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                All Permissions
                            </Link>
                        </Button>

                        <div className="flex gap-2">
                            {can.edit && (
                                <Button size="sm" variant="secondary" asChild>
                                    <Link href={route('permissions.edit', permission.id)}>
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
                                    <CardTitle className="text-2xl">{permission.label}</CardTitle>
                                    <p className="text-muted-foreground">{permission.name}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {permission.description && (
                                <div>
                                    <strong>Description:</strong>
                                    <p className="mt-1 text-muted-foreground">{permission.description}</p>
                                </div>
                            )}

                            <div>
                                <strong>Assigned Roles:</strong>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {permission.roles.length > 0 ? (
                                        permission.roles.map((role) => (
                                            <Badge key={role.id} variant="outline">
                                                {role.label}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground">None</span>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Created: {new Date(permission.created_at).toLocaleDateString()} •
                                Updated: {new Date(permission.updated_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
