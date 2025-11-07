'use client';

import { Table } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useRoute } from 'ziggy-js';
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
    routeName: string;
    queryParams?: Record<string, any>;
    emptyMessage?: string;
    children: React.ReactNode;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200] as const;

export default function DataTable<T>({
                                         title,
                                         data,
                                         pagination,
                                         routeName,
                                         queryParams = {},
                                         emptyMessage = 'No records found.',
                                         children,
                                     }: DataTableProps<T>) {
    const route = useRoute();

    const goToPage = (page: number) => {
        router.get(route(routeName), { page, ...queryParams }, {
            preserveState: true,
            replace: true,
        });
    };

    const changePerPage = (value: string) => {
        const perPage = parseInt(value);
        router.get(route(routeName), { per_page: perPage, page: 1, ...queryParams }, {
            preserveState: true,
            replace: true,
        });
    };

    if (data.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div>
            <div className="bg-card text-card-foreground flex flex-col rounded-xl border p-0.5 shadow-sm">
                <div className="rounded-md border overflow-hidden">
                    <Table>{children}</Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-sm">
                    <div className="text-muted-foreground">
                        Page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-muted-foreground hidden sm:inline">
                            Show
                        </span>
                        <Select
                            value={pagination.per_page.toString()}
                            onValueChange={changePerPage}
                        >
                            <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PER_PAGE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt.toString()}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground hidden sm:inline">
                            per page
                        </span>
                    </div>

                    <p className="text-muted-foreground text-center sm:text-left">
                        Showing {pagination.from}–{pagination.to} of {pagination.total}
                    </p>

                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(1)}
                            disabled={pagination.current_page === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => goToPage(pagination.last_page)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
