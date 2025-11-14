// resources/js/Pages/Enquiry/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useRoute } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';
import { index as enquiry } from '@/routes/enquiries/index';
import type { BreadcrumbItem } from '@/types';
import { Contact } from '@/types/contact';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import ContactEnquiry from '@/components/blocks/ContactEnquiry';

interface CallLog {
    id: number;
    mobile: string;
    call_type: string;
    duration: number | null;
    enquiry: string | null;
    created_at: string;
    deleted_at: string | null;
    contact: {
        id: number;
        name: string;
        company: string | null;
        mobile: string | null;
    };
    handler: { id: number; name: string } | null;
}

interface EnquiryPageProps {
    call_logs: {
        data: CallLog[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
    can: { create: boolean; delete: boolean };
    trashedCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Enquiry', href: enquiry().url },
];

export default function Index() {
    const {
        call_logs,
        filters: serverFilters,
        can,
    } = usePage().props as unknown as EnquiryPageProps;
    const route = useRoute();
    const [localFilters, setLocalFilters] = useState({
        contact_id: serverFilters.search || '',
    });

    const [isNavigating, setIsNavigating] = useState(false);

    // Sync server filters → local state
    useEffect(() => {
        setLocalFilters({
            contact_id: serverFilters.search || '',
        });
    }, [serverFilters]);

    // Build URL payload
    const buildPayload = useCallback(
        () => ({
            search: localFilters.contact_id || undefined,
        }),
        [localFilters],
    );

    // Navigate with filters
    const navigate = useCallback(
        (extra = {}) => {
            setIsNavigating(true);
            router.get(
                route('enquiry.index'),
                { ...buildPayload(), ...extra },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsNavigating(false),
                },
            );
        },
        [route, buildPayload],
    );

    // ──────────────────────────────────────────────────────────────
    // CONTACT AUTOCOMPLETE
    // ──────────────────────────────────────────────────────────────
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );

    const handleContactSelect = (contact: Contact | null) => {
        setSelectedContact(contact);
        const contactId = contact ? String(contact.id) : '';
        setLocalFilters((prev) => ({ ...prev, contact_id: contactId }));
        navigate({ search: contactId });
    };

    const handleContactCreate = (name: string) => {
        // Replace with your own “open create modal / redirect” logic
        alert(`Create new contact: "${name}"`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Todos" />
            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Todos
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">
                                Track your todos
                            </p>
                        </div>
                        <div className="flex gap-3">

                            <div>
                                <Label htmlFor="contact-autocomplete">
                                    Contact <span className="text-red-500">*</span>
                                </Label>
                                <ContactEnquiry
                                    value={selectedContact}
                                    onSelect={handleContactSelect}
                                    onCreateNew={handleContactCreate}
                                    placeholder="Search contacts by name, phone, email..."
                                />
                            </div>

                            {can.create && (
                                <Button onClick={() => setShowCreate(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> New Todo
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />
                </div>
            </div>
        </AppLayout>
    );
}
