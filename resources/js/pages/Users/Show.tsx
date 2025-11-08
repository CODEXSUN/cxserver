import Layout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
    roles: { name: string }[];
    created_at: string;
}

interface ShowPageProps {
    user: User;
    can: { edit: boolean; delete: boolean };
}

export default function Show() {
    const { user, can } = usePage<ShowPageProps>().props;
    const route = useRoute();

    return (
        <Layout>
            <Head title={user.name} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        {can.edit && (
                            <Button asChild>
                                <Link href={route('users.edit', user.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <p className="text-muted-foreground">{user.email}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <strong>Status:</strong>{' '}
                                <Badge variant={user.active ? 'default' : 'secondary'}>
                                    {user.active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div>
                                <strong>Roles:</strong>{' '}
                                {user.roles.length > 0 ? (
                                    user.roles.map((r) => (
                                        <Badge key={r.name} variant="outline" className="ml-1">
                                            {r.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">None</span>
                                )}
                            </div>
                            <div>
                                <strong>Member Since:</strong>{' '}
                                {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
