// resources/js/utils/storage.ts

/**
 * Helper to generate correct URLs for files stored in Laravel's public disk.
 * Laravel symlinks: storage/app/public → public/storage
 */
export const Storage = {
    url: (path: string): string => {
        // Remove leading "public/" if present (Laravel stores as "service-parts/xxx.jpg")
        const cleanPath = path.replace(/^public\//, '');
        return `/storage/${cleanPath}`;
    },
};
