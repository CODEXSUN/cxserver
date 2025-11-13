import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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
}

interface EditPageProps {
    user: User;
    roles: Role[];
}

export default function Edit() {
    const route = useRoute();
    const { user, roles } = usePage<EditPageProps>().props;

    // -----------------------------------------------------------------
    // 1. Form state – password fields are optional
    // -----------------------------------------------------------------
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        active: user.active,
        roles: user.roles.map((r) => r.name),
        keep_password: true, // default: keep old password
    });

    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        user.roles.map((r) => r.name)
    );

    // Sync roles array with form data
    useEffect(() => {
        setData('roles', selectedRoles);
    }, [selectedRoles, setData]);

    // -----------------------------------------------------------------
    // 2. Role checkbox handler
    // -----------------------------------------------------------------
    const handleRoleChange = (roleName: string, checked: boolean) => {
        const newRoles = checked
            ? [...selectedRoles, roleName]
            : selectedRoles.filter((r) => r !== roleName);
        setSelectedRoles(newRoles);
    };

    // -----------------------------------------------------------------
    // 3. Submit – only send password if keep_password === false
    // -----------------------------------------------------------------
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { ...data };
        if (data.keep_password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        patch(route('users.update', user.id), {
            data: payload,
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
                                {/* ---------- NAME ---------- */}
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* ---------- EMAIL ---------- */}
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* ---------- KEEP PASSWORD CHECKBOX ---------- */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="keep_password"
                                        checked={data.keep_password}
                                        onCheckedChange={(checked) =>
                                            setData('keep_password', !!checked)
                                        }
                                    />
                                    <Label htmlFor="keep_password" className="cursor-pointer">
                                        Keep current password
                                    </Label>
                                </div>

                                {/* ---------- PASSWORD (shown only if keep_password === false) ---------- */}
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
                                                value={data.password_confirmation}
                                                onChange={(e) =>
                                                    setData('password_confirmation', e.target.value)
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                {/* ---------- ACTIVE ---------- */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="active"
                                        checked={data.active}
                                        onCheckedChange={(checked) => setData('active', !!checked)}
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
                                        <p className="text-sm text-destructive mt-1">{errors.roles}</p>
                                    )}
                                </div>

                                {/* ---------- ACTIONS ---------- */}
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
