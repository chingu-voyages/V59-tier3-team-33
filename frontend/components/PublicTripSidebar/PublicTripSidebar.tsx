'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import type { Trip, TabId, Place } from '@/types/trip';
import { generateTabs } from '@/utils/tripUtils';
import { TabPills } from '@/components/TripSidebar/TabPills';
import { PublicOverviewTab } from './PublicOverviewTab';
import { PublicDayTab } from './PublicDayTab';

interface PublicTripSidebarProps {
    trip: Trip;
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    onPlaceClick: (place: Place) => void;
}

export function PublicTripSidebar({ trip, activeTab, onTabChange, onPlaceClick }: PublicTripSidebarProps) {
    const tabs = useMemo(() => {
        if (!trip) return [];
        return generateTabs(trip.start_date, trip.end_date, trip.total_days);
    }, [trip]);

    const getDayNumber = (tabId: string): number => {
        const match = tabId.match(/day-(\d+)/);
        return match ? parseInt(match[1], 10) : 1;
    };

    const getDayDate = (tabId: string): string => {
        const tab = tabs.find((t) => t.id === tabId);
        return tab?.date || '';
    };

    const startDate = format(new Date(trip.start_date), 'MMM d, yyyy');
    const endDate = format(new Date(trip.end_date), 'MMM d, yyyy');

    return (
        <div className="flex flex-col h-full bg-surface-50">
            {/* Header */}
            <div className="p-4 border-b border-surface-500">
                <h2 className="text-xl font-bold text-neutral-400 mb-1">
                    {trip.name}
                </h2>
                <p className="text-sm text-neutral-300">
                    {startDate} - {endDate}
                </p>
            </div>

            {/* Tab Pills - Filter out favorites */}
            <TabPills
                tabs={tabs.filter(tab => tab.id !== 'favorites')}
                activeTab={activeTab}
                onTabChange={onTabChange}
            />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {activeTab === 'overview' && (
                    <PublicOverviewTab trip={trip} onPlaceClick={onPlaceClick} />
                )}

                {activeTab.startsWith('day-') && (
                    <PublicDayTab
                        dayNumber={getDayNumber(activeTab)}
                        date={getDayDate(activeTab)}
                        trip={trip}
                        onPlaceClick={onPlaceClick}
                    />
                )}
            </div>
        </div>
    );
}
