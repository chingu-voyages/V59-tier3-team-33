'use client';

import { format } from 'date-fns';
import type { Trip, Place } from '@/types/trip';

interface PublicOverviewTabProps {
    trip: Trip;
    onPlaceClick: (place: Place) => void;
}

export function PublicOverviewTab({ trip, onPlaceClick }: PublicOverviewTabProps) {
    const tripDays = trip.trip_days || [];

    const daysWithEvents = tripDays.filter(day => day.events && day.events.length > 0);

    if (daysWithEvents.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="text-neutral-300 mb-2">No Events Planned Yet</div>
                <p className="text-sm text-neutral-200">
                    This trip doesn't have any events scheduled.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {daysWithEvents.map((day, index) => {
                const dayEvents = day.events || [];
                const formattedDate = format(new Date(day.date), 'EEEE, MMMM d');

                return (
                    <div key={day.id}>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-neutral-400">
                                {formattedDate}
                            </h3>
                            <p className="text-sm text-neutral-300">
                                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                            </p>
                        </div>

                        {dayEvents.length > 0 && (
                            <div className="relative pl-8">
                                {index < daysWithEvents.length - 1 && (
                                    <div
                                        className="absolute left-4 bg-secondary-200"
                                        style={{
                                            top: '3rem',
                                            bottom: '-3rem',
                                            width: '2px'
                                        }}
                                    />
                                )}

                                <div className="space-y-4">
                                    {dayEvents.map((event, idx) => (
                                        <div key={event.id} className="relative flex gap-3">
                                            <div className="shrink-0 flex flex-col items-center">
                                                <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center z-10 shadow-md">
                                                    <span className="text-xs font-bold text-white">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 pt-0.5">
                                                <div
                                                    className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => onPlaceClick(event.place_details)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-neutral-400">
                                                                {event.place_details.name}
                                                            </h4>
                                                            <p className="text-sm text-neutral-200 break-words">
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
