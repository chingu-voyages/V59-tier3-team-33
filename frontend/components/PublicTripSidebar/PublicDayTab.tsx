'use client';

import { format } from 'date-fns';
import type { Trip, Place } from '@/types/trip';

interface PublicDayTabProps {
    dayNumber: number;
    date: string;
    trip: Trip;
    onPlaceClick: (place: Place) => void;
}

export function PublicDayTab({ dayNumber, date, trip, onPlaceClick }: PublicDayTabProps) {
    const tripDays = trip.trip_days || [];
    const currentDay = tripDays.find(day => day.date === date);
    const events = currentDay?.events || [];

    const formatDate = (dateStr: string) => {
        return format(new Date(dateStr), 'MMM d');
    };

    const lodgings = tripDays
        .filter(day => {
            const dayDate = new Date(day.date);
            return dayDate.toISOString().split('T')[0] === date;
        })
        .flatMap(day => []);

    return (
        <div className="p-4 space-y-4">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-neutral-400">
                    {format(new Date(date), 'EEEE, MMMM d')}
                </h2>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-neutral-300 mb-2">No events for this day</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Events</span>
                    </div>

                    <div className="space-y-4">
                        {events.map((event, index) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => onPlaceClick(event.place_details)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0 w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-neutral-400 truncate">
                                            {event.place_details.name}
                                        </h4>
                                        <p className="text-sm text-neutral-200 truncate">
                                            {event.place_details.address}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-1 bg-secondary-200 text-secondary-700 rounded-full text-xs font-medium capitalize">
                                                {event.type.toLowerCase()}
                                            </span>
                                            {event.notes && (
                                                <span className="text-xs text-neutral-300 truncate">
                                                    {event.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
