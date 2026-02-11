'use client';

import { FaCalendarDay, FaMapMarkerAlt, FaClock, FaUtensils, FaCar, FaEllipsisH } from 'react-icons/fa';
import { useTripStore } from '@/store/tripStore';
import { Event } from '@/types/trip';

interface DayTabProps {
    dayNumber: number;
    date: string;
}

const EVENT_TYPE_ICONS = {
    ACTIVITY: FaMapMarkerAlt,
    TRANSPORT: FaCar,
    MEAL: FaUtensils,
    OTHER: FaEllipsisH,
};

const EVENT_TYPE_COLORS = {
    ACTIVITY: 'bg-primary-100 text-primary-400',
    TRANSPORT: 'bg-secondary-100 text-secondary-400',
    MEAL: 'bg-danger-100 text-danger-400',
    OTHER: 'bg-neutral-100 text-neutral-400',
};

export function DayTab({ dayNumber, date }: DayTabProps) {
    const { trip } = useTripStore();

    // Find the trip day for this date (date is in YYYY-MM-DD format)
    const tripDay = trip?.trip_days?.find((day) => day.date === date);
    const events = tripDay?.events || [];

    // Sort events by position
    const sortedEvents = [...events].sort((a, b) => a.position - b.position);

    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    if (sortedEvents.length === 0) {
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
                    {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
                </p>
            </div>

            {/* Events List */}
            {sortedEvents.map((event, index) => {
                const Icon = EVENT_TYPE_ICONS[event.type];
                const colorClass = EVENT_TYPE_COLORS[event.type];

                return (
                    <div
                        key={event.id}
                        className="flex gap-3 p-4 bg-surface-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                        {/* Position Number */}
                        <div className="shrink-0 w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-neutral-400">{index + 1}</span>
                        </div>

                        {/* Icon */}
                        <div className={`shrink-0 w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
                            <Icon />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-neutral-400 truncate">
                                {event.place_details.name}
                            </h4>
                            <p className="text-sm text-neutral-200 truncate">
                                {event.place_details.address}
                            </p>

                            {/* Time and Duration */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-300">
                                <div className="flex items-center gap-1">
                                    <FaClock />
                                    <span>{event.start_time}</span>
                                </div>
                                {event.duration > 0 && (
                                    <span>• {event.duration} min</span>
                                )}
                                <span className="px-2 py-0.5 bg-surface-200 rounded-full">
                                    {event.type}
                                </span>
                            </div>

                            {/* Notes */}
                            {event.notes && (
                                <p className="text-sm text-neutral-300 mt-2 italic">
                                    {event.notes}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
