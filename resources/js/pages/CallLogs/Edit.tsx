// resources/js/Pages/CallLogs/Edit.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useRoute } from 'ziggy-js';
import React from 'react';
import ContactAutocomplete from '@/components/blocks/ContactAutocomplete';

interface Contact {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string;
    company: string | null;
    contact_type: { id: number; name: string };
}

interface CallLog {
    id: number;
    mobile: string;
    contact_id: number;
    call_type: string;
    duration: number | null;
    enquiry: string | null;
    user_id: number | null;
}

interface UserOption {
    id: number;
    name: string;
}

interface EditPageProps {
    call_log: CallLog;
    contacts: Contact[];
    users: UserOption[];
}

const findContactById = (contacts: Contact[], id: number): Contact | null =>
    contacts.find((c) => c.id === id) ?? null;

export default function Edit() {
    const route = useRoute();
    const { call_log, contacts, users } = usePage().props as unknown as EditPageProps;

    const { data, setData, put, processing, errors } = useForm({
        mobile: call_log.mobile,
        contact_id: String(call_log.contact_id),
        call_type: call_log.call_type,
        duration: String(call_log.duration || ''),
        enquiry: call_log.enquiry || '',
        user_id: String(call_log.user_id || ''),
    });

    const initialContact = React.useMemo(
        () => findContactById(contacts, call_log.contact_id),
        [contacts, call_log.contact_id]
    );

    const [selectedContact, setSelectedContact] = React.useState<Contact | null>(initialContact);

    const handleContactSelect = (contact: Contact | null) => {
        setSelectedContact(contact);
        setData('contact_id', contact ? String(contact.id) : '');
    };

    const handleContactCreate = (name: string) => {
        alert(`Create new contact: "${name}"`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('calls.update', call_log.id));
    };

    return (
        <Layout>
            <Head title="Edit Call Log" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('calls.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Call Log</h1>
                            <p className="text-muted-foreground">Update call details</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 rounded-lg bg-white p-6 shadow"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="mobile">
                                    Mobile <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="mobile"
                                    value={data.mobile}
                                    onChange={(e) => setData('mobile', e.target.value)}
                                    placeholder="Mobile number"
                                />
                                {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
                            </div>

                            <div>
                                <Label htmlFor="contact-autocomplete">
                                    Contact <span className="text-red-500">*</span>
                                </Label>
                                <ContactAutocomplete
                                    value={selectedContact}
                                    onSelect={handleContactSelect}
                                    onCreateNew={handleContactCreate}
                                    placeholder="Search contacts..."
                                />
                                {errors.contact_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.contact_id}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="call_type">
                                    Call Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.call_type}
                                    onValueChange={(v) => setData('call_type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incoming">Incoming</SelectItem>
                                        <SelectItem value="outgoing">Outgoing</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.call_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.call_type}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="duration">Duration (seconds)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={data.duration}
                                    onChange={(e) => setData('duration', e.target.value)}
                                    placeholder="Duration in seconds"
                                />
                            </div>

                            <div>
                                <Label htmlFor="user_id">Handled By</Label>
                                <Select
                                    value={data.user_id}
                                    onValueChange={(v) => setData('user_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select handler (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="enquiry">Enquiry / Query</Label>
                            <Textarea
                                id="enquiry"
                                value={data.enquiry}
                                onChange={(e) => setData('enquiry', e.target.value)}
                                placeholder="Details of the call..."
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('calls.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Call Log'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
