'use client';

import { useRef, useState, useEffect } from 'react';
import { FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Tab, TabId } from '@/types/trip';

interface TabPillsProps {
    tabs: Tab[];
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function TabPills({ tabs, activeTab, onTabChange }: TabPillsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [tabs]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 200;
        const newScrollLeft = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative border-b border-surface-500">
            {/* Left Arrow */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-50 shadow-lg rounded-full border flex items-center justify-center hover:bg-surface-100 transition-colors"
                    aria-label="Scroll left"
                >
                    <FaChevronLeft className="text-neutral-400 text-sm" />
                </button>
            )}

            {/* Tabs Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-2 p-4 overflow-x-auto scrollbar-hide w-10/12 mx-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const isFavorites = tab.id === 'favorites';

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                            flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap border
                            ${isActive
                                    ? 'bg-primary-50 text-primary shadow-md'
                                    : 'bg-surface-200 text-neutral-300 hover:bg-surface-300'
                                }
                            `}
                        >
                            {/* Favorites: Only show outline heart icon */}
                            {isFavorites ? (
                                <FaRegHeart className="text-lg" />
                            ) : (
                                <>
                                    {/* Other tabs: Only show label */}
                                    <span>{tab.label}</span>
                                    {tab.displayDate && (
                                        <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-70'}`}>
                                            ({tab.displayDate})
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-50 shadow-lg rounded-full border flex items-center justify-center hover:bg-surface-100 transition-colors"
                    aria-label="Scroll right"
                >
                    <FaChevronRight className="text-neutral-400 text-sm" />
                </button>
            )}
        </div>
    );
}
