'use client';

import { Table } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import React from 'react';

interface Pagination {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface DataTableProps<T> {
    title?: string;
    data: T[];
    pagination: Pagination;
    perPage?: number;               // current per-page (local state)
    onPerPageChange?: (perPage: number) => void;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
    children: React.ReactNode;
    isLoading?: boolean;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200] as const;

export default function DataTable<T>({
                                         title,
                                         data,
                                         pagination,
                                         perPage,
                                         onPerPageChange,
                                         onPageChange,
                                         emptyMessage = 'No records found.',
                                         children,
                                         isLoading = false,
                                     }: DataTableProps<T>) {
    // -----------------------------------------------------------------
    // Handlers – simply forward to parent (Index.tsx)
    // -----------------------------------------------------------------
    const changePerPage = (value: string) => {
        const pp = parseInt(value, 10);
        onPerPageChange?.(pp);
    };

    const goToPage = (page: number) => {
        onPageChange?.(page);
    };

    // -----------------------------------------------------------------
    // Empty state
    // -----------------------------------------------------------------
    if (data.length === 0 && !isLoading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    // -----------------------------------------------------------------
    // Main table + pagination UI
    // -----------------------------------------------------------------
    return (
        <div>
            <div className="bg-card text-card-foreground flex flex-col rounded-xl border p-0.5 shadow-sm">
                <div className="rounded-md border overflow-hidden">
                    <Table>{children}</Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-sm">
                    {/* Page info */}
                    <div className="text-muted-foreground">
                        Page <strong>{pagination.current_page}</strong> of{' '}
                        <strong>{pagination.last_page}</strong>
                    </div>

                    {/* Per-page selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-muted-foreground hidden sm:inline">
                            Show
                        </span>
                        <Select
                            value={(perPage ?? pagination.per_page).toString()}
                            onValueChange={changePerPage}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PER_PAGE_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt}
                                        value={opt.toString()}
                                    >
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground hidden sm:inline">
                            per page
                        </span>
                    </div>

                    {/* Showing X-Y of Z */}
                    <p className="text-muted-foreground text-center sm:text-left">
                        Showing {pagination.from}–{pagination.to} of{' '}
                        {pagination.total}
                    </p>

                    {/* Page navigation buttons */}
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(1)}
                            disabled={pagination.current_page === 1 || isLoading}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                goToPage(pagination.current_page - 1)
                            }
                            disabled={pagination.current_page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                goToPage(pagination.current_page + 1)
                            }
                            disabled={
                                pagination.current_page ===
                                pagination.last_page || isLoading
                            }
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(pagination.last_page)}
                            disabled={
                                pagination.current_page ===
                                pagination.last_page || isLoading
                            }
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
