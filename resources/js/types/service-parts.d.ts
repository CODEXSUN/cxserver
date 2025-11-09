// ─────────────────────────────────────────────────────────────────────────────
//  Service‑Parts Type Definitions
//  Place this file in:  resources/js/types/service-parts.d.ts
//  (or any folder you prefer – just keep the import path consistent)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main Service‑Part model as returned by Laravel (Inertia props)
 */
export interface ServicePart {
    id: number;
    part_code: string;
    name: string;
    brand: string | null;
    model: string | null;
    unit_price: string | number;
    current_stock: string | number;
    barcode: string | null;
    remarks: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;

    /** Relationship – loaded via `->load('images')` */
    images?: ServicePartImage[];
}

/**
 * Service‑Part image record (belongs to a ServicePart)
 */
export interface ServicePartImage {
    id: number;
    service_part_id: number;
    image_path: string;   // e.g. "service-parts/abc123.jpg"
    thumb_path: string;   // e.g. "service-parts/thumbs/abc123_thumb.jpg"
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

/* -------------------------------------------------------------------------
   OPTIONAL: Re‑export everything from this file so you can write:
       import type { ServicePart, ServicePartImage } from '@/types';
   ------------------------------------------------------------------------- */
