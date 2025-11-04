'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, RotateCcw, MoreHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface TableActionsProps {
    id: number;
    editRoute: string;
    deleteRoute: string;
    restoreRoute?: string;
    forceDeleteRoute?: string;
    isDeleted: boolean;
    canDelete: boolean;
}

export default function TableActions({
                                         id,
                                         editRoute,
                                         deleteRoute,
                                         restoreRoute,
                                         forceDeleteRoute,
                                         isDeleted,
                                         canDelete,
                                     }: TableActionsProps) {
    const handleDelete = () => {
        if (confirm('Move to trash?')) {
            router.delete(deleteRoute, { preserveScroll: true });
        }
    };

    const handleRestore = () => {
        if (restoreRoute) {
            router.post(restoreRoute, {}, { preserveScroll: true });
        }
    };

    const handleForceDelete = () => {
        if (forceDeleteRoute && confirm('Delete permanently?')) {
            router.delete(forceDeleteRoute, { preserveScroll: true });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isDeleted ? (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={editRoute}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        {canDelete && (
                            <DropdownMenuItem className="text-destructive" onSelect={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                            </DropdownMenuItem>
                        )}
                    </>
                ) : (
                    <>
                        {restoreRoute && (
                            <DropdownMenuItem onSelect={handleRestore}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Restore
                            </DropdownMenuItem>
                        )}
                        {forceDeleteRoute && (
                            <DropdownMenuItem className="text-destructive" onSelect={handleForceDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
