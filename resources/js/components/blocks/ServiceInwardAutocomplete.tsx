// resources/js/Components/ServiceInwardAutocomplete.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Loader2, Plus, Laptop, Monitor, Printer, Phone } from 'lucide-react';
import { useRoute } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ServiceInward } from '@/types';

interface Props {
    value?: ServiceInward | null;
    onSelect: (inward: ServiceInward | null) => void;
    placeholder?: string;
    className?: string;
    onCreateNew?: (query: string) => void;
    label?: string;
}

const typeIcons = {
    laptop: Laptop,
    desktop: Monitor,
    printer: Printer,
};

const typeColors = {
    laptop: 'bg-blue-500',
    desktop: 'bg-purple-500',
    printer: 'bg-orange-500',
};

export default function ServiceInwardAutocomplete({
                                                      value,
                                                      onSelect,
                                                      placeholder = 'Search by RMA, Serial, Customer, Mobile...',
                                                      className = '',
                                                      onCreateNew,
                                                      label
                                                  }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ServiceInward[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedInward, setSelectedInward] = useState<ServiceInward | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const route = useRoute();
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastQueryRef = useRef<string>('');

    // Sync external value
    useEffect(() => {
        if (value) {
            setSelectedInward(value);
            setQuery(value.rma);
            setResults([]);
            setShowDropdown(false);
        } else {
            setSelectedInward(null);
            setQuery('');
        }
    }, [value]);

    // Click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showDropdown || selectedInward) return;
            const total = results.length + (query.length >= 2 && results.length === 0 ? 1 : 0);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex(p => (p < total - 1 ? p + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex(p => (p > 0 ? p - 1 : total - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0 && highlightedIndex < results.length) {
                        handleSelect(results[highlightedIndex]);
                    } else if (query.length >= 2 && results.length === 0 && highlightedIndex === 0) {
                        handleCreateNew();
                    }
                    break;
                case 'Escape':
                    setShowDropdown(false);
                    setHighlightedIndex(-1);
                    inputRef.current?.focus();
                    break;
            }
        };
        if (showDropdown) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showDropdown, results, highlightedIndex, query, selectedInward]);

    // Scroll into view
    useEffect(() => {
        itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex]);

    // Cancel previous request
    const cancelPrev = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, []);

    // Trigger search (debounced)
    const triggerSearch = useCallback((q: string) => {
        if (q === lastQueryRef.current || selectedInward) return;
        lastQueryRef.current = q;

        cancelPrev();
        if (q.length < 2) {
            setResults([]);
            setShowDropdown(false);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        setLoading(true);
        fetchInwards(q, controller.signal);
    }, [selectedInward, cancelPrev]);

    useEffect(() => {
        const t = setTimeout(() => triggerSearch(query), 150);
        return () => clearTimeout(t);
    }, [query, triggerSearch]);

    // Fetch from API
    const fetchInwards = async (q: string, signal: AbortSignal) => {
        try {
            const url = `${route('service_inwards.search')}?q=${encodeURIComponent(q)}`;
            const res = await fetch(url, {
                method: 'GET',
                signal,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setResults(data.inwards ?? []);
            setShowDropdown(true);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error(err);
                setResults([]);
            }
        } finally {
            if (abortControllerRef.current?.signal === signal) {
                setLoading(false);
            }
        }
    };

    // Select inward
    const handleSelect = useCallback((inward: ServiceInward) => {
        cancelPrev();
        lastQueryRef.current = '';
        setSelectedInward(inward);
        setQuery(inward.rma);
        setResults([]);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        onSelect(inward);
        inputRef.current?.blur();
    }, [onSelect, cancelPrev]);

    // Create new
    const handleCreateNew = useCallback(() => {
        cancelPrev();
        if (onCreateNew && query.trim()) onCreateNew(query.trim());
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
    }, [onCreateNew, query, cancelPrev]);

    // Clear selection
    const handleClear = useCallback(() => {
        cancelPrev();
        lastQueryRef.current = '';
        setSelectedInward(null);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        onSelect(null);
        inputRef.current?.focus();
    }, [onSelect, cancelPrev]);

    const displayValue = selectedInward ? selectedInward.rma : query;
    const showCreate = query.length >= 2 && results.length === 0 && !loading && !selectedInward;
    const TypeIcon = selectedInward ? typeIcons[selectedInward.material_type] : null;

    return (
        <div className={cn('space-y-2', className)}>
            {label && <label className="text-sm font-medium">{label}</label>}

            <div className="relative">
                {/* Input – More left padding when selected */}
                <Input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        const v = e.target.value;
                        setQuery(v);
                        if (selectedInward) {
                            setSelectedInward(null);
                            onSelect(null);
                        }
                    }}
                    onFocus={() => {
                        if (!selectedInward && query.length >= 2 && (results.length > 0 || showCreate)) {
                            setShowDropdown(true);
                        }
                    }}
                    placeholder={placeholder}
                    className={cn("pr-10", selectedInward && "pl-2 text-2xl font-bold tracking-widest")}  // Increased to pl-32
                />

                {/* Loading */}
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* Badge & Icon (Selected) */}
                {!loading && selectedInward && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {TypeIcon && <TypeIcon className="h-4 w-4 text-white" />}
                        <Badge className={cn('text-xs px-2 py-0.5 text-white', typeColors[selectedInward.material_type])}>
                            {selectedInward.material_type}
                        </Badge>
                    </div>
                )}

                {/* Clear Button */}
                {!loading && selectedInward && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Search / Dropdown Icon */}
                {!loading && !selectedInward && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showDropdown ? <ChevronDown className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </div>
                )}

                {/* Dropdown */}
                {showDropdown && (
                    <div
                        ref={dropdownRef}
                        className="absolute left-0 right-0 top-full mt-1 z-50 w-full max-w-md rounded-md border bg-popover text-popover-foreground shadow-lg max-h-60 overflow-auto p-1"
                    >
                        {results.length > 0 ? (
                            <ul className="space-y-1">
                                {results.map((inward, i) => {
                                    const Icon = typeIcons[inward.material_type];
                                    return (
                                        <li
                                            key={inward.id}
                                            ref={el => itemRefs.current[i] = el}
                                            onClick={() => handleSelect(inward)}
                                            onMouseEnter={() => setHighlightedIndex(i)}
                                            className={cn(
                                                'cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors',
                                                highlightedIndex === i ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{inward.rma}</span>
                                                        <Badge className={cn('text-xs px-1 py-0 text-white', typeColors[inward.material_type])}>
                                                            <Icon className="h-3 w-3 mr-1" />
                                                            {inward.material_type}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        <span className="font-medium">{inward.contact.name}</span>
                                                        {inward.contact.mobile && (
                                                            <span className="ml-2 flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {inward.contact.mobile}
                                                            </span>
                                                        )}
                                                        {inward.serial_no && (
                                                            <span className="ml-2">SN: {inward.serial_no}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : null}

                        {/* Create New */}
                        {showCreate && (
                            <div className="border-t pt-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn('w-full justify-start text-sm', highlightedIndex === results.length && 'bg-accent')}
                                    onClick={handleCreateNew}
                                    onMouseEnter={() => setHighlightedIndex(results.length)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create new inward: <span className="ml-1 font-medium">"{query}"</span>
                                </Button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!showCreate && results.length === 0 && query.length >= 2 && (
                            <div className="px-3 py-2 text-center text-sm text-muted-foreground">
                                No inwards found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
