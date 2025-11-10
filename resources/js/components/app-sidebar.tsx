import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    MonitorCog,
    Folder,
    LayoutGrid,
    Laptop,
    Bolt,
    Contact,
    StickyNote,
    NotebookPen,
    UserRoundSearch,
    Drill,
    ServerCrash,
} from 'lucide-react';


import AppLogo from './app-logo';
import {index as blogs} from '@/routes/blogs';
import { index as contactTypes } from '@/routes/contact-types';
import { index as contacts } from '@/routes/contacts';
import { index as service_inward } from '@/routes/service_inwards';
import { index as job_cards } from '@/routes/job_cards';
// import { index as users } from '@/routes/users';
import { index as job_assignment } from '@/routes/job_assignments';
import {index as service_parts } from '@/routes/service_parts';
import {index as job_spare_requests } from '@/routes/job_spare_requests';
import {index as out_service_centers } from '@/routes/out_service_centers';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Blog',
        href: blogs(),
        icon: StickyNote,
    },
    {
        title: 'Contact-type',
        href: contactTypes(),
        icon: UserRoundSearch,
    },
    {
        title: 'Contact',
        href: contacts(),
        icon: Contact,
    },
    {
        title: 'Service Inward',
        href: service_inward(),
        icon: Laptop,
    },
    {
        title: 'Job-card',
        href: job_cards(),
        icon: MonitorCog,
    },
    {
        title: 'Job-assignment',
        href: job_assignment(),
        icon: NotebookPen,
    },
    {
        title: 'Service Parts',
        href: service_parts(),
        icon: Bolt,
    },
    {
        title: 'Spares Request',
        href: job_spare_requests(),
        icon: Drill,
    },
    {
        title: 'Out Service Center',
        href: out_service_centers(),
        icon: ServerCrash,
    },
    //
    // {
    //     title: 'User',
    //     href: users(),
    //     icon: MonitorCog,
    // },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
