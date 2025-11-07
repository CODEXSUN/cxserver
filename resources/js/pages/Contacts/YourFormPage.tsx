// resources/js/Pages/Contacts/YourFormPage.tsx
import ContactAutocomplete from '../../components/blocks/ContactAutocomplete';
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Contact {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string;
    company: string | null;
    contact_type: { id: number; name: string };
}

export default function YourFormPage() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const route = useRoute();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedContact) {
            console.log('Selected Contact ID:', selectedContact.id);
            router.visit(route('contacts.edit', selectedContact.id));
        }
    };

    const handleCreateNew = (name: string) => {
        router.visit(route('contacts.create'), {
            data: { name },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Select Contact" />
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6">Contact Selection</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <ContactAutocomplete
                                label="Contact"
                                value={selectedContact}
                                onSelect={setSelectedContact}
                                onCreateNew={handleCreateNew}
                                placeholder="Search by name, mobile, email..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={!selectedContact}
                                className={cn(
                                    'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white',
                                    selectedContact
                                        ? 'bg-primary hover:bg-primary/90'
                                        : 'bg-gray-400 cursor-not-allowed'
                                )}
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
