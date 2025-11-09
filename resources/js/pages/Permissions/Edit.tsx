import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    label: string;
    description: string | null;
}

interface EditPageProps {
    permission: Permission;
}

export default function Edit() {
    const route = useRoute();
    const { permission } = usePage<EditPageProps>().props;

    const { data, setData, patch, processing, errors } = useForm({
        name: permission.name,
        label: permission.label,
        description: permission.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('permissions.update', permission.id));
    };

    return (
        <Layout>
            <Head title={`Edit Permission: ${permission.label}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
                            <p className="text-muted-foreground mt-1">Update permission details</p>
                        </div>
                        <Button variant="ghost" asChild>
                            <Link href={route('permissions.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name (slug)</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="label">Label</Label>
                                        <Input
                                            id="label"
                                            value={data.label}
                                            onChange={(e) => setData('label', e.target.value)}
                                            required
                                        />
                                        {errors.label && <p className="text-sm text-destructive mt-1">{errors.label}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Permission'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={route('permissions.index')}>Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
