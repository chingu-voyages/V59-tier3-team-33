import { Tab } from '@/types/trip';
import { formatDate } from '@/lib/date-utils';

/**
 * Generate tabs from trip date range
 */
export function generateTabs(startDate: string, endDate: string, totalDays: number): Tab[] {
  const tabs: Tab[] = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'overview', label: 'Overview' },
  ];

  // Generate day tabs
  const start = new Date(startDate);
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    // Format for display (e.g., "Feb 1")
    const displayDate = currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    // Format for matching with API (YYYY-MM-DD)
    const apiDate = currentDate.toISOString().split('T')[0];
    
    tabs.push({
      id: `day-${i + 1}` as `day-${number}`,
      label: `Day ${i + 1}`,
      date: apiDate, // Use API format for matching
      displayDate, // Add display format for UI
    });
  }

  return tabs;
}
