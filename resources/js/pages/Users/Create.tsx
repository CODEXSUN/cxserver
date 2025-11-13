// resources/js/Pages/Users/Create.tsx

import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState, useRef } from 'react';

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

interface CreatePageProps {
    roles: Role[];
}

export default function Create() {
    const route = useRoute();
    const { roles } = usePage<CreatePageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        active: true,
        roles: [] as string[],
        profile_photo: null as File | null,
    });

    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRoleChange = (roleName: string, checked: boolean) => {
        const newRoles = checked
            ? [...selectedRoles, roleName]
            : selectedRoles.filter((r) => r !== roleName);
        setSelectedRoles(newRoles);
        setData('roles', newRoles);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_photo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const removePhoto = () => {
        setPreview(null);
        setData('profile_photo', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
        formData.append('active', data.active ? '1' : '0');

        selectedRoles.forEach((role, index) => {
            formData.append(`roles[${index}]`, role);
        });

        if (data.profile_photo) {
            formData.append('profile_photo', data.profile_photo);
        }

        post(route('users.store'), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <Layout>
            <Head title="Create User" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('users.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold">Create New User</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* ---------- PROFILE PHOTO ---------- */}
                                <div className="space-y-4">
                                    <Label>Profile Photo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="h-24 w-24 rounded-full object-cover border"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 rounded-full bg-muted border-2 border-dashed flex items-center justify-center">
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            {preview && (
                                                <button
                                                    type="button"
                                                    onClick={removePhoto}
                                                    className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={openFilePicker}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Photo
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                JPG, PNG, GIF up to 2MB
                                            </p>
                                        </div>
                                    </div>
                                    {errors.profile_photo && (
                                        <p className="text-sm text-destructive">{errors.profile_photo}</p>
                                    )}
                                </div>

                                {/* Name, Email, Password, etc. */}
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="active"
                                        checked={data.active}
                                        onCheckedChange={(checked) => setData('active', !!checked)}
                                    />
                                    <Label htmlFor="active">Active</Label>
                                </div>

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

                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('users.index')}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create User'}
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
