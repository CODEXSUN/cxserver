// resources/js/Pages/Users/Edit.tsx

import Layout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { useState, useRef, useEffect } from 'react';
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
    roles: string[];
    profile_photo_url?: string | null;
}

interface EditPageProps {
    user: User;
    roles: Role[];
}

export default function Edit() {
    const route = useRoute();
    const { user, roles } = usePage<EditPageProps>().props;

    // -----------------------------------------------------------------
    // Form Data
    // -----------------------------------------------------------------
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        active: user.active,
        roles: user.roles,
        keep_password: true,
    });

    const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // -----------------------------------------------------------------
    // Profile photo handling
    // -----------------------------------------------------------------
    const [preview, setPreview] = useState<string | null>(user.profile_photo_url || null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const removePhoto = () => {
        setPhotoFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // -----------------------------------------------------------------
    // Role checkbox handler
    // -----------------------------------------------------------------
    const handleRoleChange = (roleName: string, checked: boolean) => {
        setSelectedRoles((prev) => {
            const cleanPrev = prev.filter((r) => typeof r === 'string' && r.trim() !== '');
            return checked
                ? Array.from(new Set([...cleanPrev, roleName]))
                : cleanPrev.filter((r) => r !== roleName);
        });
    };

    // Keep roles in sync
    useEffect(() => {
        setFormData((p) => ({ ...p, roles: selectedRoles }));
    }, [selectedRoles]);

    // -----------------------------------------------------------------
    // Submit handler
    // -----------------------------------------------------------------
    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setProcessing(true);
    //     setErrors({});
    //
    //     const fd = new FormData();
    //     fd.append('_method', 'PUT');
    //     fd.append('name', formData.name);
    //     fd.append('email', formData.email);
    //     fd.append('active', formData.active ? '1' : '0');
    //     fd.append('keep_password', formData.keep_password ? '1' : '0');
    //
    //     if (!formData.keep_password) {
    //         fd.append('password', formData.password);
    //         fd.append('password_confirmation', formData.password_confirmation);
    //     }
    //
    //     // ✅ Filter undefined / null roles
    //     const validRoles = (formData.roles || []).filter(
    //         (r): r is string => typeof r === 'string' && r.trim() !== ''
    //     );
    //
    //     validRoles.forEach((role, i) => fd.append(`roles[${i}]`, role));
    //
    //     if (photoFile) {
    //         fd.append('profile_photo', photoFile);
    //     }
    //
    //     router.post(route('users.update', user.id), fd, {
    //         forceFormData: true,
    //         onSuccess: () => {
    //             if (fileInputRef.current) fileInputRef.current.value = '';
    //         },
    //         onError: (err) => setErrors(err),
    //         onFinish: () => setProcessing(false),
    //     });
    // };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // ✅ Force-sync roles before sending
        const finalRoles = selectedRoles.filter(
            (r): r is string => typeof r === 'string' && r.trim() !== ''
        );

        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('name', formData.name);
        fd.append('email', formData.email);
        fd.append('active', formData.active ? '1' : '0');
        fd.append('keep_password', formData.keep_password ? '1' : '0');

        if (!formData.keep_password) {
            fd.append('password', formData.password);
            fd.append('password_confirmation', formData.password_confirmation);
        }

        // ✅ Append roles as array (Laravel expects roles[0], roles[1]…)
        finalRoles.forEach((role, i) => fd.append(`roles[${i}]`, role));

        if (photoFile) {
            fd.append('profile_photo', photoFile);
        }

        router.post(route('users.update', user.id), fd, {
            forceFormData: true,
            onSuccess: () => {
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (err) => setErrors(err),
            onFinish: () => setProcessing(false),
        });
    };



    // -----------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------
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

                                {/* ---------- NAME ---------- */}
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, name: e.target.value }))
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* ---------- EMAIL ---------- */}
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, email: e.target.value }))
                                        }
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* ---------- KEEP PASSWORD ---------- */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="keep_password"
                                        checked={formData.keep_password}
                                        onCheckedChange={(checked) =>
                                            setFormData((p) => ({
                                                ...p,
                                                keep_password: !!checked,
                                            }))
                                        }
                                    />
                                    <Label htmlFor="keep_password" className="cursor-pointer">
                                        Keep current password
                                    </Label>
                                </div>

                                {/* ---------- PASSWORD (only if unchecked) ---------- */}
                                {!formData.keep_password && (
                                    <>
                                        <div>
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                minLength={8}
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        password: e.target.value,
                                                    }))
                                                }
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="password_confirmation">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={formData.password_confirmation}
                                                onChange={(e) =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        password_confirmation: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ---------- ACTIVE ---------- */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="active"
                                        checked={formData.active}
                                        onCheckedChange={(checked) =>
                                            setFormData((p) => ({ ...p, active: !!checked }))
                                        }
                                    />
                                    <Label htmlFor="active">Active</Label>
                                </div>

                                {/* ---------- ROLES ---------- */}
                                <div>
                                    <Label>Roles</Label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {roles.map((role) => (
                                            <label
                                                key={role.id}
                                                className="flex items-center space-x-2 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={selectedRoles.includes(role.name)}
                                                    onCheckedChange={(checked) =>
                                                        handleRoleChange(role.name, !!checked)
                                                    }
                                                />
                                                <span className="text-sm">
                                                    {role.label || role.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.roles && (
                                        <p className="text-sm text-destructive mt-1">
                                            {errors.roles}
                                        </p>
                                    )}
                                </div>

                                {/* ---------- ACTIONS ---------- */}
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('users.index')}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Update User'}
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
