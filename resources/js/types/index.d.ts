import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
    role: 'admin' | 'super-admin' | 'technician' | 'user'; // ← adjust as needed
}

export interface Blog {
    id: number;
    title: string;
    slug: string;
    body: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    user_id: number;
    author?: { name: string };
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

// resources/js/types/index.ts
export interface ServiceInward {
    id: number;
    rma: string;
    material_type: 'laptop' | 'desktop' | 'printer';
    serial_no: string | null;
    brand: string | null;
    model: string | null;
    received_date: string | null;
    deleted_at: string | null;
    contact: {
        id: number;
        name: string;
        mobile: string | null;
        company?: string | null;
    };
}
