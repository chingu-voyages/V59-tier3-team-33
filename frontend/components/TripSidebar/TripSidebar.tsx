import { useMemo } from 'react';
import { useTripStore } from '@/store/tripStore';
import { generateTabs } from '@/utils/tripUtils';
import { SidebarHeader } from './SidebarHeader';
import { TabPills } from './TabPills';
import { FavoritesTab } from './FavoritesTab';
import { OverviewTab } from './OverviewTab';
import { DayTab } from './DayTab';

export function TripSidebar() {
    const { trip, favoriteIds, activeTab, setActiveTab } = useTripStore();

    // Generate tabs from trip dates
    const tabs = useMemo(() => {
        if (!trip) return [];
        return generateTabs(trip.start_date, trip.end_date, trip.total_days);
    }, [trip]);

    // Loading state
    if (!trip) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-neutral-300">Loading trip...</p>
                </div>
            </div>
        );
    }

    // Extract day number from tab id (e.g., "day-1" -> 1)
    const getDayNumber = (tabId: string): number => {
        const match = tabId.match(/day-(\d+)/);
        return match ? parseInt(match[1], 10) : 1;
    };

    // Get date for day tab
    const getDayDate = (tabId: string): string => {
        const tab = tabs.find((t) => t.id === tabId);
        return tab?.date || '';
    };

    return (
        <div className="flex flex-col h-full bg-surface-50">
            {/* Header */}
            <SidebarHeader tripName={trip.name} />

            {/* Tab Pills */}
            <TabPills tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'favorites' && <FavoritesTab />}

                {activeTab === 'overview' && (
                    <OverviewTab trip={trip} favoritesCount={favoriteIds.length} />
                )}

                {activeTab.startsWith('day-') && (
                    <DayTab
                        dayNumber={getDayNumber(activeTab)}
                        date={getDayDate(activeTab)}
                    />
                )}
            </div>
        </div>
    );
}
