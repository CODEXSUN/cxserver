import Layout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const route = useRoute();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        label: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('permissions.store'));
    };

    return (
        <Layout>
            <Head title="Create Permission" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create New Permission</h1>
                            <p className="text-muted-foreground mt-1">Define a new system permission</p>
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
                            <CardTitle>Permission Details</CardTitle>
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
                                            placeholder="user.create"
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
                                            placeholder="Create Users"
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
                                        placeholder="Allows creating new user accounts..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Permission'}
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
