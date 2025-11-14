// status.ts
export const priorities: Record<string, { label: string; className: string }> = {
    low: {
        label: 'Low',
        className: 'bg-neutral-300/40 border-neutral-300 text-black',
    },
    medium: {
        label: 'Medium',
        className: 'bg-orange-200/30 text-orange-900 dark:text-orange-200 border-orange-200',
    },
    high: {
        label: 'High',
        className: 'bg-destructive text-white dark:bg-destructive dark:text-primary border-destructive/10',
    },
};
