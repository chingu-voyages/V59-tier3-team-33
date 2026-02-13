'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { searchLocation, type NominatimResult } from '@/services/nominatim';
import { Search, X, MapPin } from 'lucide-react';

interface MapSearchProps {
    onLocationSelect: (result: NominatimResult) => void;
    className?: string;
}

export function MapSearch({ onLocationSelect, className = '' }: MapSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const searchResults = await searchLocation(searchQuery, { limit: 5 });
            setResults(searchResults);
            setIsOpen(true);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const handleResultClick = (result: NominatimResult) => {
        setQuery(result.display_name);
        setIsOpen(false);
        onLocationSelect(result);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-200" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder="Search places..."
                    className="w-full pl-12 pr-10 py-3 bg-surface-50 border border-surface-500 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-lg"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-200 hover:text-neutral-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-surface-50 border border-surface-500 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                    {isLoading ? (
                        <div className="p-4 text-center text-neutral-300">Searching...</div>
                    ) : results.length > 0 ? (
                        <ul>
                            {results.map((result) => (
                                <li key={result.place_id}>
                                    <button
                                        onClick={() => handleResultClick(result)}
                                        className="w-full px-4 py-3 text-left hover:bg-surface-100 flex items-start gap-3 border-b border-surface-500 last:border-b-0"
                                    >
                                        <MapPin className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-neutral-400 truncate">
                                                {result.display_name.split(',')[0]}
                                            </div>
                                            <div className="text-xs text-neutral-300 truncate">
                                                {result.display_name}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : query.trim() ? (
                        <div className="p-4 text-center text-neutral-300">No results found</div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
