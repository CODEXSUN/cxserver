// resources/js/Pages/Contacts/Create.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

// shad cn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';

interface ContactType {
    id: number;
    name: string;
}
interface CreatePageProps extends InertiaPageProps {
    contactTypes: { id: number; name: string }[];
}

interface CreatePageProps {
    contactTypes: ContactType[];
}

export default function Create() {
    const route = useRoute();
    const { contactTypes } = usePage<CreatePageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        mobile: '',
        email: '',
        phone: '',
        company: '',
        contact_type_id: '',
        has_web_access: false,
        active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contacts.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <Layout>
            <Head title="Create Contact" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create Contact</h1>
                            <p className="text-muted-foreground mt-1">Add a new contact to the system</p>
                        </div>
                        <Button variant="ghost" asChild>
                            <Link href={route('contacts.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                            <CardDescription>Fill in the information below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile *</Label>
                                        <Input
                                            id="mobile"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                            required
                                        />
                                        {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_type_id">Contact Type *</Label>
                                        <Select
                                            value={data.contact_type_id}
                                            onValueChange={(value) => setData('contact_type_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contactTypes.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.contact_type_id && (
                                            <p className="text-sm text-destructive">{errors.contact_type_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="active"
                                            checked={data.active}
                                            onCheckedChange={(checked) => setData('active', checked)}
                                        />
                                        <Label htmlFor="active">Active</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="has_web_access"
                                            checked={data.has_web_access}
                                            onCheckedChange={(checked) => setData('has_web_access', checked)}
                                        />
                                        <Label htmlFor="has_web_access">Web Access</Label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Contact'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={route('contacts.index')}>Cancel</Link>
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
