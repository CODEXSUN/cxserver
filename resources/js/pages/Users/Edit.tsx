// resources/js/Pages/Users/Edit.tsx

import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    label: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
    roles: { name: string }[];
    profile_photo_url: string | null;
    default_profile_photo_url: string | null;
}

interface EditPageProps {
    user: User;
    roles: Role[];
}

export default function Edit() {
    const route = useRoute();
    const { user, roles } = usePage<EditPageProps>().props;

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        active: user.active,
        roles: user.roles.map((r) => r.name),
        keep_password: true,
        profile_photo: null as File | null,
        delete_photo: false,
    });

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles.map((r) => r.name));

    // Initialize preview
    useEffect(() => {
        if (user.profile_photo_url && user.profile_photo_url !== user.default_profile_photo_url) {
            setPreview(user.profile_photo_url);
        }
    }, [user.profile_photo_url, user.default_profile_photo_url]);

    // Sync roles
    useEffect(() => {
        setData('roles', selectedRoles);
    }, [selectedRoles, setData]);

    const handleRoleChange = (roleName: string, checked: boolean) => {
        const newRoles = checked
            ? [...selectedRoles, roleName]
            : selectedRoles.filter((r) => r !== roleName);
        setSelectedRoles(newRoles);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_photo', file);
            setPreview(URL.createObjectURL(file));
            setData('delete_photo', false);
        }
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('active', data.active ? '1' : '0');

        selectedRoles.forEach((role, index) => {
            formData.append(`roles[${index}]`, role);
        });

        if (!data.keep_password) {
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);
        }

        if (data.delete_photo) {
            formData.append('delete_photo', '1');
        } else if (data.profile_photo) {
            formData.append('profile_photo', data.profile_photo);
        }

        patch(route('users.update', user.id), {
            data: formData,
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <Layout>
            <Head title={`Edit User: ${user.name}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Edit User</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Update User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* PROFILE PHOTO */}
                                <div className="space-y-4">
                                    <Label>Profile Photo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={preview || user.profile_photo_url || user.default_profile_photo_url}
                                                alt={user.name}
                                                className="h-24 w-24 rounded-full object-cover border"
                                            />
                                            {(preview && preview !== user.default_profile_photo_url) || (user.profile_photo_url && user.profile_photo_url !== user.default_profile_photo_url) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreview(user.default_profile_photo_url);
                                                        setData('delete_photo', true);
                                                        setData('profile_photo', null);
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                    className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Change Photo
                                            </Button>
                                            <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                                        </div>
                                    </div>
                                    {errors.profile_photo && <p className="text-sm text-destructive">{errors.profile_photo}</p>}
                                </div>

                                {/* NAME */}
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                </div>

                                {/* EMAIL */}
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                            id="keep_password"
                                            checked={data.keep_password}
                                            onCheckedChange={(checked) => setData('keep_password', !!checked)}
                                        />
                                        <Label htmlFor="keep_password">Keep current password</Label>
                                    </div>
                                    {!data.keep_password && (
                                        <>
                                            <div>
                                                <Label htmlFor="password">New Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Leave blank to keep current"
                                                    minLength={8}
                                                />
                                                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* ACTIVE */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="active" checked={data.active} onCheckedChange={(checked) => setData('active', !!checked)} />
                                    <Label htmlFor="active">Active</Label>
                                </div>

                                {/* ROLES */}
                                <div>
                                    <Label>Roles</Label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {roles.map((role) => (
                                            <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                                                <Checkbox
                                                    checked={selectedRoles.includes(role.name)}
                                                    onCheckedChange={(checked) => handleRoleChange(role.name, !!checked)}
                                                />
                                                <span className="text-sm">{role.label || role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.roles && <p className="text-sm text-destructive mt-1">{errors.roles}</p>}
                                </div>

                                {/* ACTIONS */}
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('users.index')}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update User'}
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
