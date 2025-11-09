import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppSidebarHeader({
                                     breadcrumbs = [],
                                     taskCount = 0,
                                 }: {
    breadcrumbs?: BreadcrumbItemType[];
    taskCount?: number;
}) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="relative inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white
                            text-sm font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:pointer-events-none
                            disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800
                            dark:focus:bg-neutral-800"
                        >
                            <svg
                                className="size-5 shrink-0"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                            </svg>
                            {taskCount > 0 && (
                                <span className="absolute end-0 top-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center
                                rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white animate-pulse">
                                    {taskCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[140px]">
                        <div className="px-3 py-2 text-sm font-medium">
                            {taskCount > 0 ? `Pending Task ${taskCount}` : 'No pending tasks'}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
