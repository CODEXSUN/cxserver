// resources/js/types/contact.d.ts
export interface Contact {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string;
    company: string | null;
    contact_type: { id: number; name: string };
}

export interface ContactType {
    id: number;
    name: string;
}
