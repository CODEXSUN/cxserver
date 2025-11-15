// resources/js/Pages/Enquiry/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute } from 'ziggy-js';

import ContactEnquiry from '@/components/blocks/ContactEnquiry';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import { index as enquiry } from '@/routes/enquiries/index';
import type { BreadcrumbItem } from '@/types';
import { Contact } from '@/types/contact';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

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

interface ServiceInward {
    id: number;
    created_at: string;
    description: string;
    status: string;
    // Add more fields as needed
}

interface JobCard {
    id: number;
    created_at: string;
    job_type: string;
    status: string;
    // Add more fields as needed
}

interface ContactNote {
    id: number;
    note: string;
    created_at: string;
    user: { id: number; name: string };
    children?: ContactNote[];
    parent_id?: number | null;
}

interface EnquiryPageProps {
    contact: Contact | null;
    call_logs: CallLog[];
    service_inwards: ServiceInward[];
    job_cards: JobCard[];
    filters: {
        contact_id?: string;
    };
    can: { create: boolean; delete: boolean };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Enquiry', href: enquiry().url },
];

export default function Index() {
    const {
        contact: serverContact,
        call_logs,
        service_inwards,
        job_cards,
        filters: serverFilters,
        can,
    } = usePage().props as unknown as EnquiryPageProps;
    const route = useRoute();
    const [localFilters, setLocalFilters] = useState({
        contact_id: serverFilters.contact_id || '',
    });

    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(serverContact);
    const [notes, setNotes] = useState<ContactNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [submittingNote, setSubmittingNote] = useState(false);

    // Sync server filters → local state
    useEffect(() => {
        setLocalFilters({
            contact_id: serverFilters.contact_id || '',
        });
        setSelectedContact(serverContact);
    }, [serverFilters, serverContact]);

    // Build URL payload
    const buildPayload = useCallback(
        () => ({
            contact_id: localFilters.contact_id || undefined,
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

    // CONTACT AUTOCOMPLETE
    const handleContactSelect = (contact: Contact | null) => {
        setSelectedContact(contact);
        const contactId = contact ? String(contact.id) : '';
        setLocalFilters((prev) => ({ ...prev, contact_id: contactId }));
        navigate({ contact_id: contactId });
        setNotes([]);
    };

    const handleContactCreate = (name: string) => {
        // Replace with your own “open create modal / redirect” logic
        alert(`Create new contact: "${name}"`);
    };

    // Fetch notes when a contact is selected
    useEffect(() => {
        if (selectedContact) {
            setLoadingNotes(true);
            axios
                .get(route('contact-notes.index', selectedContact.id))
                .then((response) => {
                    setNotes(response.data.notes || []);
                })
                .catch((error) => {
                    console.error('Failed to fetch notes:', error);
                    setNotes([]);
                })
                .finally(() => setLoadingNotes(false));
        } else {
            setNotes([]);
        }
    }, [selectedContact, route]);

    // Handle submitting a new note
    const handleSubmitNote = async () => {
        if (!selectedContact || !newNote.trim()) return;

        setSubmittingNote(true);
        try {
            const response = await axios.post(route('contact-notes.store', selectedContact.id), { note: newNote });
            setNotes((prev) => [...prev, response.data]); // Assuming response returns the new note
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        } finally {
            setSubmittingNote(false);
        }
    };

    // Render notes recursively for replies
    const renderNotes = (notes: ContactNote[], level = 0): JSX.Element[] => {
        return notes.map((note) => (
            <div key={note.id} className={`p-2 border-b ${level > 0 ? 'ml-4 border-l' : ''}`}>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{note.user.name}</span>
                    <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                </div>
                <p>{note.note}</p>
                {note.children && note.children.length > 0 && (
                    <div>{renderNotes(note.children, level + 1)}</div>
                )}
            </div>
        ));
    };

    // Handle Get Details button click
    const handleGetDetails = () => {
        if (selectedContact) {
            navigate(); // Refresh with current filters
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enquiry" />
            <div className="py-6">
                <div className="mx-auto space-y-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-black/50">
                                Enquiry
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-black/30">
                                Track your enquiry
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between">
                        <div className="w-full">
                            <ContactEnquiry
                                value={selectedContact}
                                onSelect={handleContactSelect}
                                onCreateNew={handleContactCreate}
                                placeholder="Search contacts by name, phone, email..."
                            />
                        </div>

                        <div className="flex gap-3">
                            {can.create && (
                                <Button onClick={handleGetDetails} disabled={!selectedContact || isNavigating}>
                                    <ArrowRight className="mr-2 h-4 w-4" /> Get Details
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Contact History */}
                    {selectedContact ? (
                        <Tabs defaultValue="call-logs" className="relative mr-auto w-full">
                            <TabsList className="justify-start">
                                <TabsTrigger value="call-logs">Call History</TabsTrigger>
                                <TabsTrigger value="service-inwards">Service Inwards</TabsTrigger>
                                <TabsTrigger value="job-cards">Job Cards</TabsTrigger>
                                <TabsTrigger value="notes">Enquiry Notes</TabsTrigger>
                            </TabsList>
                            <TabsContent value="call-logs">
                                <div className="overflow-auto max-h-[60vh]">
                                    <h2 className="text-lg font-semibold mb-2">Call Logs</h2>
                                    {call_logs.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Duration</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Enquiry</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Handler</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {call_logs.map((log) => (
                                                <tr key={log.id} className="cursor-pointer hover:bg-gray-100">
                                                    <td className="px-4 py-2 text-sm">{new Date(log.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-sm">{log.call_type}</td>
                                                    <td className="px-4 py-2 text-sm">{log.duration ? `${log.duration}s` : 'N/A'}</td>
                                                    <td className="px-4 py-2 text-sm">{log.enquiry || 'N/A'}</td>
                                                    <td className="px-4 py-2 text-sm">{log.handler?.name || 'N/A'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No call logs found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="service-inwards">
                                <div className="overflow-auto max-h-[60vh]">
                                    <h2 className="text-lg font-semibold mb-2">Service Inwards</h2>
                                    {service_inwards.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {service_inwards.map((inward) => (
                                                <tr key={inward.id} className="cursor-pointer hover:bg-gray-100">
                                                    <td className="px-4 py-2 text-sm">{new Date(inward.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-sm">{inward.description || 'N/A'}</td>
                                                    <td className="px-4 py-2 text-sm">{inward.status || 'N/A'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No service inwards found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="job-cards">
                                <div className="overflow-auto max-h-[60vh]">
                                    <h2 className="text-lg font-semibold mb-2">Job Cards</h2>
                                    {job_cards.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Job Type</th>
                                                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {job_cards.map((card) => (
                                                <tr key={card.id} className="cursor-pointer hover:bg-gray-100">
                                                    <td className="px-4 py-2 text-sm">{new Date(card.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-sm">{card.job_type || 'N/A'}</td>
                                                    <td className="px-4 py-2 text-sm">{card.status || 'N/A'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No job cards found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="notes">
                                <div className="border rounded-md p-4 overflow-auto max-h-[60vh]">
                                    <h2 className="text-lg font-semibold mb-2">Enquiry Notes</h2>
                                    {loadingNotes ? (
                                        <p>Loading notes...</p>
                                    ) : notes.length > 0 ? (
                                        <div className="space-y-2">{renderNotes(notes.filter(n => !n.parent_id))}</div>
                                    ) : (
                                        <p>No notes available.</p>
                                    )}
                                    <div className="mt-4">
                                        <Textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Add a new note..."
                                            className="mb-2"
                                        />
                                        <Button onClick={handleSubmitNote} disabled={submittingNote}>
                                            {submittingNote ? 'Submitting...' : 'Add Note'}
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <p className="text-center text-muted-foreground">Select a contact to view history.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
