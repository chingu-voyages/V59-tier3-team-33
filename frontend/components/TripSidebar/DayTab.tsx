'use client';

import { FaCalendarDay } from 'react-icons/fa';
import { useTripStore } from '@/store/tripStore';
import { PlaceCard } from '@/components/PlaceCard';

interface DayTabProps {
    dayNumber: number;
    date: string;
}

export function DayTab({ dayNumber, date }: DayTabProps) {
    const { tripDaysById, eventsByDayId, eventsById, selectPlaceFromEvent } = useTripStore();

    // Find the trip day for this date
    const tripDay = Object.values(tripDaysById).find((day) => day.date === date);
    const eventIds = tripDay ? eventsByDayId[tripDay.id] || [] : [];
    const events = eventIds.map(id => eventsById[id]).sort((a, b) => a.position - b.position);

    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                    <FaCalendarDay className="text-3xl text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-400 mb-1">
                    Day {dayNumber}
                </h3>
                <p className="text-neutral-200 text-sm mb-4">{displayDate}</p>
                <p className="text-neutral-300 font-medium mb-1">No events scheduled</p>
                <p className="text-neutral-200 text-sm">
                    Search and assign places to this day
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {/* Day Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-neutral-400">
                    Day {dayNumber}
                </h3>
                <p className="text-sm text-neutral-200">{displayDate}</p>
                <p className="text-xs text-neutral-300 mt-1">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                </p>
            </div>

            {/* Events List */}
            {events.map((event, index) => (
                <PlaceCard
                    key={event.id}
                    data={event}
                    type="event"
                    onClick={() => selectPlaceFromEvent(event.id)}
                />
            ))}
        </div>
    );
}
