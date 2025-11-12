// resources/js/Pages/Contacts/Edit.tsx

import Layout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';

interface ContactType {
    id: number;
    name: string;
}

interface Contact {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    contact_type_id: number;
    has_web_access: boolean;
    active: boolean;
}

interface EditPageProps extends InertiaPageProps {
    contact: Contact;
    contactTypes: ContactType[];
}

export default function Edit() {
    const route = useRoute();
    const { contact, contactTypes } = usePage<EditPageProps>().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: contact.name,
        mobile: contact.mobile,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        contact_type_id: String(contact.contact_type_id),
        has_web_access: contact.has_web_access,
        active: contact.active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('contacts.update', contact.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <Layout>
            <Head title="Edit Contact" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
                            <p className="text-muted-foreground mt-1">
                                Update contact information
                            </p>
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
                            <CardDescription>
                                Make changes to the contact below
                            </CardDescription>
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
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile *</Label>
                                        <Input
                                            id="mobile"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                            required
                                        />
                                        {errors.mobile && (
                                            <p className="text-sm text-destructive">{errors.mobile}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-destructive">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                        />
                                        {errors.company && (
                                            <p className="text-sm text-destructive">{errors.company}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_type_id">Contact Type *</Label>
                                        <Select
                                            value={data.contact_type_id}
                                            onValueChange={(value) =>
                                                setData('contact_type_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contactTypes.map((type) => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={String(type.id)}
                                                    >
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.contact_type_id && (
                                            <p className="text-sm text-destructive">
                                                {errors.contact_type_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="active"
                                            checked={data.active}
                                            onCheckedChange={(checked) =>
                                                setData('active', checked)
                                            }
                                        />
                                        <Label htmlFor="active">Active</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="has_web_access"
                                            checked={data.has_web_access}
                                            onCheckedChange={(checked) =>
                                                setData('has_web_access', checked)
                                            }
                                        />
                                        <Label htmlFor="has_web_access">Web Access</Label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Contact'}
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
