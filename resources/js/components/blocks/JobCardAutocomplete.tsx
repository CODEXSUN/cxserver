'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    X,
    Loader2,
    Plus,
    Package,
    Hash,
    User,
    CheckCircle,
} from 'lucide-react';
import { useRoute } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JobCard {
    id: number;
    job_no: string;
    rma: string;
    material_type: string;
    contact: { id: number; name: string };
    delivered_at: string | null;
    service_inward: { brand: string | null; model: string | null };
}

interface JobCardAutocompleteProps {
    value?: JobCard | null;
    onSelect: (jobCard: JobCard | null) => void;
    placeholder?: string;
    className?: string;
    onCreateNew?: (rma: string) => void;
    label?: string;
}

export default function JobCardAutocomplete({
                                                value,
                                                onSelect,
                                                placeholder = 'Search by RMA, Job #, Contact...',
                                                className = '',
                                                onCreateNew,
                                                label,
                                            }: JobCardAutocompleteProps) {
    /* ------------------------------------------------------------------ *
     *  STATE
     * ------------------------------------------------------------------ */
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const route = useRoute();
    const abortRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    /* ------------------------------------------------------------------ *
     *  SYNC EXTERNAL VALUE
     * ------------------------------------------------------------------ */
    useEffect(() => {
        if (value) {
            setSelectedJobCard(value);
            setQuery(`${value.rma} – ${value.job_no}`);
            setResults([]);
            setShowDropdown(false);
        } else {
            setSelectedJobCard(null);
            setQuery('');
        }
    }, [value]);

    /* ------------------------------------------------------------------ *
     *  CLICK OUTSIDE → CLOSE
     * ------------------------------------------------------------------ */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ------------------------------------------------------------------ *
     *  SEARCH FUNCTION (no state deps)
     * ------------------------------------------------------------------ */
    const performSearch = async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        // abort previous request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await fetch(
                `${route('jobcards.search')}?q=${encodeURIComponent(q)}`,
                {
                    signal: controller.signal,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                }
            );
            if (!res.ok) throw new Error();
            const data = await res.json();
            setResults(data.jobcards ?? []);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Job‑card search error:', err);
                setResults([]);
            }
        } finally {
            setLoading(false);
        }
    };

    /* ------------------------------------------------------------------ *
     *  INPUT → DEBOUNCED SEARCH (no useEffect loop)
     * ------------------------------------------------------------------ */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setShowDropdown(true);
        setSelectedJobCard(null);
        onSelect(null);

        // clear previous timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // start new one
        timeoutRef.current = setTimeout(() => performSearch(val), 300);
    };

    /* ------------------------------------------------------------------ *
     *  HANDLERS
     * ------------------------------------------------------------------ */
    const handleSelect = (jc: JobCard) => {
        setSelectedJobCard(jc);
        setQuery(`${jc.rma} – ${jc.job_no}`);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        onSelect(jc);
    };

    const handleCreateNew = () => {
        setShowDropdown(false);
        onCreateNew?.(query.trim());
    };

    const handleClear = () => {
        setQuery('');
        setSelectedJobCard(null);
        setResults([]);
        setShowDropdown(false);
        onSelect(null);
        inputRef.current?.focus();
    };

    /* ------------------------------------------------------------------ *
     *  CREATE‑NEW BUTTON LOGIC (after results)
     * ------------------------------------------------------------------ */
    const showCreateButton = query.length >= 2 && results.length === 0;

    /* ------------------------------------------------------------------ *
     *  KEYBOARD NAVIGATION
     * ------------------------------------------------------------------ */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!showDropdown) return;

            const total = results.length + (showCreateButton ? 1 : 0);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0) {
                        if (highlightedIndex < results.length) {
                            handleSelect(results[highlightedIndex]);
                        } else if (showCreateButton) {
                            handleCreateNew();
                        }
                    }
                    break;
                case 'Escape':
                    setShowDropdown(false);
                    setHighlightedIndex(-1);
                    break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showDropdown, results, highlightedIndex, showCreateButton]);

    /* ------------------------------------------------------------------ *
     *  RENDER
     * ------------------------------------------------------------------ */
    return (
        <div className={cn('relative', className)}>
            {label && <Label className="mb-1 block">{label}</Label>}

            <div className="relative">
                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.length >= 2 && setShowDropdown(true)}
                    placeholder={placeholder}
                    className="pr-10"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {selectedJobCard && !loading && (
                        <button onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    {!selectedJobCard && !loading && <Search className="h-4 w-4 text-muted-foreground" />}
                </div>
            </div>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full bg-popover text-popover-foreground rounded-md border shadow-lg max-h-96 overflow-auto"
                >
                    {/* RESULTS */}
                    {results.length > 0 ? (
                        <ul className="py-1">
                            {results.map((jc, i) => (
                                <li
                                    key={jc.id}
                                    className={cn(
                                        'px-3 py-2 cursor-pointer transition-colors',
                                        highlightedIndex === i
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                    )}
                                    onClick={() => handleSelect(jc)}
                                    onMouseEnter={() => setHighlightedIndex(i)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="font-medium truncate">{jc.job_no}</span>
                                                <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                          {jc.material_type}
                        </span>
                                                {jc.delivered_at && (
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-3 w-3" />
                                                    <span className="truncate">{jc.rma}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span className="truncate">{jc.contact.name}</span>
                                                </div>
                                                {(jc.service_inward.brand || jc.service_inward.model) && (
                                                    <div className="flex items-center gap-1">
                            <span className="truncate">
                              {jc.service_inward.brand} {jc.service_inward.model}
                            </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {/* CREATE NEW */}
                    {showCreateButton && (
                        <div className="border-t border-border pt-2 mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'w-full justify-start text-sm',
                                    highlightedIndex === results.length && 'bg-accent text-accent-foreground'
                                )}
                                onClick={handleCreateNew}
                                onMouseEnter={() => setHighlightedIndex(results.length)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create new job card for RMA:{' '}
                                <span className="ml-1 font-medium">"{query}"</span>
                            </Button>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!showCreateButton && results.length === 0 && query.length >= 2 && (
                        <div className="px-3 py-2 text-center text-sm text-muted-foreground">
                            No job cards found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
