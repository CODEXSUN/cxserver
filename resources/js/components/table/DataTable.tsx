// resources/js/components/table/DataTable.tsx

'use client';

import { Table} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
}

type QueryParamValue = string | number | boolean | undefined;

interface DataTableProps<T> {
    title: string;
    data: T[];
    pagination: Pagination;
    routeName: string;
    queryParams?: Record<string, QueryParamValue>;
    emptyMessage?: string;
    children: React.ReactNode;
}

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
        router.get(route(routeName), { page, ...queryParams }, { preserveState: true, replace: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                </p>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                        <p className="text-muted-foreground">{emptyMessage}</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>{children}</Table>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Page {pagination.current_page} of {pagination.last_page}
                            </div>
                            <div className="flex items-center gap-2">
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
                    </>
                )}
            </CardContent>
        </Card>
    );
}
