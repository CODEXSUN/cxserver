// resources/js/types/inertia.d.ts
import '@inertiajs/react';

// Use `type` → no members = no warning
declare module '@inertiajs/core' {
    type PageProps = Record<string, unknown>;
}
