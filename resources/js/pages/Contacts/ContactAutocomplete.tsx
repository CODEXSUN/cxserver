// resources/js/Components/ContactAutocomplete.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Loader2, Plus, Phone, Mail, Building } from 'lucide-react';
import { useRoute } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Contact {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string;
    company: string | null;
    contact_type: { id: number; name: string };
}

interface ContactAutocompleteProps {
    value?: Contact | null;
    onSelect: (contact: Contact | null) => void;
    placeholder?: string;
    className?: string;
    onCreateNew?: (name: string) => void;
    label?: string;
}

export default function ContactAutocomplete({
                                                value,
                                                onSelect,
                                                placeholder = 'Search contacts...',
                                                className = '',
                                                onCreateNew,
                                                label
                                            }: ContactAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const route = useRoute();
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastQueryRef = useRef<string>('');

    // === Sync external value (controlled mode) ===
    useEffect(() => {
        if (value) {
            setSelectedContact(value);
            setQuery(value.name);
            setResults([]);
            setShowDropdown(false);
        } else {
            setSelectedContact(null);
            setQuery('');
        }
    }, [value]);

    // === Click outside to close ===
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // === Keyboard navigation ===
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showDropdown || selectedContact) return;

            const totalItems = results.length + (query.length >= 2 && results.length === 0 ? 1 : 0);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedIndex >= 0) {
                        if (results.length > 0 && highlightedIndex < results.length) {
                            handleSelect(results[highlightedIndex]);
                        } else if (query.length >= 2 && results.length === 0 && highlightedIndex === 0) {
                            handleCreateNew();
                        }
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
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
    }, [showDropdown, results, highlightedIndex, query, selectedContact]);

    // === Scroll highlighted into view ===
    useEffect(() => {
        const el = itemRefs.current[highlightedIndex];
        el?.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex]);

    // === Cancel previous request ===
    const cancelPreviousRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // === Debounced search (only when not selected) ===
    const triggerSearch = useCallback((search: string) => {
        if (search === lastQueryRef.current || selectedContact) return;
        lastQueryRef.current = search;

        cancelPreviousRequest();

        if (search.length < 2) {
            setResults([]);
            setShowDropdown(false);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        fetchContacts(search, controller.signal);
    }, [selectedContact, cancelPreviousRequest]);

    useEffect(() => {
        const timer = setTimeout(() => {
            triggerSearch(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query, triggerSearch]);

    const fetchContacts = async (search: string, signal: AbortSignal) => {
        try {
            const baseUrl = route('contacts.search');
            const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}q=${encodeURIComponent(search)}`;

            const response = await fetch(url, {
                method: 'GET',
                signal,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setResults(data.contacts ?? []);
            setShowDropdown(true);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Search failed:', error);
                setResults([]);
                setShowDropdown(true);
            }
        } finally {
            if (abortControllerRef.current?.signal === signal) {
                setLoading(false);
            }
        }
    };

    const handleSelect = useCallback((contact: Contact) => {
        cancelPreviousRequest();
        lastQueryRef.current = '';
        setSelectedContact(contact);
        setQuery(contact.name);
        setResults([]);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        setLoading(false);
        onSelect(contact);
        inputRef.current?.blur();
    }, [onSelect, cancelPreviousRequest]);

    const handleCreateNew = useCallback(() => {
        cancelPreviousRequest();
        lastQueryRef.current = '';
        if (onCreateNew && query.trim()) {
            onCreateNew(query.trim());
        }
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
    }, [onCreateNew, query, cancelPreviousRequest]);

    const handleClear = useCallback(() => {
        cancelPreviousRequest();
        lastQueryRef.current = '';
        setSelectedContact(null);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        setLoading(false);
        onSelect(null);
        inputRef.current?.focus();
    }, [onSelect, cancelPreviousRequest]);

    const displayValue = selectedContact ? selectedContact.name : query;
    const showCreateButton = query.length >= 2 && results.length === 0 && !loading && !selectedContact;

    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label htmlFor="contact-autocomplete">{label}</Label>}

            <div className="relative">
                <Input
                    id="contact-autocomplete"
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        setQuery(val);
                        if (selectedContact) {
                            setSelectedContact(null);
                            onSelect(null);
                        }
                    }}
                    onFocus={() => {
                        if (!selectedContact && query.length >= 2 && (results.length > 0 || showCreateButton)) {
                            setShowDropdown(true);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && !selectedContact) {
                            e.preventDefault();
                            setShowDropdown(true);
                            setHighlightedIndex(0);
                        }
                    }}
                    placeholder={placeholder}
                    className="pr-10 transition-none"
                />

                {/* Icons */}
                {loading && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && selectedContact && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {!loading && !selectedContact && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors">
                        {showDropdown ? <ChevronDown className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        'absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg',
                        'max-h-60 overflow-auto p-1 transition-opacity duration-100'
                    )}
                    style={{ display: 'block' }}
                >
                    {results.length > 0 ? (
                        <ul className="space-y-1">
                            {results.map((contact, idx) => (
                                <li
                                    key={contact.id}
                                    ref={(el) => {
                                        itemRefs.current[idx] = el;
                                    }}
                                    onClick={() => handleSelect(contact)}
                                    onMouseEnter={() => setHighlightedIndex(idx)}
                                    className={cn(
                                        'relative cursor-pointer select-none rounded-sm px-3 py-2 text-sm outline-none transition-colors duration-75',
                                        highlightedIndex === idx
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{contact.name}</span>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {contact.contact_type.name}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                {contact.mobile && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {contact.mobile}
                                                    </div>
                                                )}
                                                {contact.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {contact.email}
                                                    </div>
                                                )}
                                                {contact.company && (
                                                    <div className="flex items-center gap-1">
                                                        <Building className="h-3 w-3" />
                                                        {contact.company}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {/* Create New Button */}
                    {showCreateButton && (
                        <div className="border-t border-border pt-2 mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'w-full justify-start text-sm transition-colors duration-75',
                                    highlightedIndex === results.length && 'bg-accent text-accent-foreground'
                                )}
                                onClick={handleCreateNew}
                                onMouseEnter={() => setHighlightedIndex(results.length)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create new contact: <span className="ml-1 font-medium">"{query}"</span>
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!showCreateButton && results.length === 0 && query.length >= 2 && (
                        <div className="px-3 py-2 text-center text-sm text-muted-foreground">
                            No contacts found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
