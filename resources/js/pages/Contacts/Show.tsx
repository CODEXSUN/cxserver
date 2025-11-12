// resources/js/Pages/Contacts/Show.tsx
import Layout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Mail, Phone, Building, User, Globe, CheckCircle, XCircle } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    mobile: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    contact_type: { id: number; name: string };
    has_web_access: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
}

interface ShowPageProps {
    contact: Contact;
    can: { edit: boolean; delete: boolean };
}

export default function Show() {
    const route = useRoute();
    const { contact, can } = usePage<ShowPageProps>().props;

    return (
        <Layout>
            <Head title={`Contact: ${contact.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('contacts.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>

                        <div className="flex gap-2">
                            {can.edit && (
                                <Button asChild size="sm">
                                    <Link href={route('contacts.edit', contact.id)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Contact Card */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <User className="h-6 w-6 text-primary" />
                                        {contact.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Contact details and access information
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-lg">
                                    {contact.contact_type.name}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Numbers
                                        </h3>
                                        <div className="space-y-1">
                                            <p className="font-medium">{contact.mobile}</p>
                                            {contact.phone && (
                                                <p className="text-sm text-muted-foreground">
                                                    Alt: {contact.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {contact.email && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                                <Mail className="h-4 w-4" />
                                                Email
                                            </h3>
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {contact.email}
                                            </a>
                                        </div>
                                    )}

                                    {contact.company && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                                                <Building className="h-4 w-4" />
                                                Company
                                            </h3>
                                            <p className="font-medium">{contact.company}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                            Status
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    {contact.active ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-600" />
                                                    )}
                                                    Account Status
                                                </span>
                                                <Badge variant={contact.active ? 'default' : 'secondary'}>
                                                    {contact.active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <Globe className="h-5 w-5 text-blue-600" />
                                                    Web Access
                                                </span>
                                                <Badge variant={contact.has_web_access ? 'default' : 'secondary'}>
                                                    {contact.has_web_access ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>
                                            Created:{' '}
                                            <span className="font-medium">
                                                {new Date(contact.created_at).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </p>
                                        <p>
                                            Updated:{' '}
                                            <span className="font-medium">
                                                {new Date(contact.updated_at).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Future: Notes / Activity Log */}
                    {/* <div className="mt-8">
                        <ContactNotes contactId={contact.id} />
                    </div> */}
                </div>
            </div>
        </Layout>
    );
}
