'use client';

import { useTripStore } from '@/store/tripStore';
import type { Trip } from '@/types/trip';
import { FaHotel } from 'react-icons/fa';
import { format } from 'date-fns';

interface OverviewTabProps {
    trip: Trip;
}

export function OverviewTab({ trip }: OverviewTabProps) {
    const {
        eventsByDayId,
        eventsById,
        lodgingsByDayId,
        lodgingsById,
        selectPlaceFromEvent,
        selectPlaceFromLodging
    } = useTripStore();

    const tripDays = trip.trip_days || [];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
        });
    };

    const daysWithContent = tripDays.filter(day => {
        const dayEventIds = eventsByDayId[day.id] || [];
        const dayLodgingIds = lodgingsByDayId[day.id] || [];
        return dayEventIds.length > 0 || dayLodgingIds.length > 0;
    });

    if (daysWithContent.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-neutral-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-400 mb-2">
                    No Events Planned Yet
                </h3>
                <p className="text-sm text-neutral-300">
                    Start adding events to your trip days to see your itinerary overview
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 overflow-y-auto overflow-x-hidden">
            {daysWithContent.map((day) => {
                const dayEventIds = eventsByDayId[day.id] || [];
                const dayEvents = dayEventIds
                    .map(id => eventsById[id])
                    .filter(Boolean)
                    .sort((a, b) => a.position - b.position);

                const dayLodgingIds = lodgingsByDayId[day.id] || [];
                const dayLodgings = dayLodgingIds
                    .map(id => lodgingsById[id])
                    .filter(Boolean);

                return (
                    <div key={day.id}>
                        <div className="mb-3">
                            <h3 className="text-lg font-bold text-neutral-400">
                                {formatDate(day.date)}
                            </h3>
                            <p className="text-xs text-neutral-300 mt-1">
                                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                                {dayLodgings.length > 0 && ` • ${dayLodgings.length} ${dayLodgings.length === 1 ? 'lodging' : 'lodgings'}`}
                            </p>
                        </div>

                        {/* Lodgings */}
                        {dayLodgings.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {dayLodgings.map((lodging) => {
                                    const checkIn = format(new Date(lodging.arrival_date), 'MMM d');
                                    const checkOut = format(new Date(lodging.departure_date), 'MMM d');

                                    return (
                                        <div
                                            key={lodging.id}
                                            onClick={() => selectPlaceFromLodging(lodging.id)}
                                            className="p-3 bg-primary-50 border border-primary-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="flex gap-3 min-w-0">
                                                <div className="shrink-0 w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
                                                    <FaHotel className="text-white text-sm" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-neutral-400 text-sm truncate">
                                                        {lodging.place_details.name}
                                                    </h4>
                                                    <p className="text-xs text-neutral-200 truncate">
                                                        {lodging.place_details.address}
                                                    </p>
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-primary-200 text-primary-700 rounded-full text-xs font-medium mt-1">
                                                        {checkIn} - {checkOut}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Events with Timeline */}
                        {dayEvents.length > 0 && (
                            <div className="relative">
                                {/* Vertical Timeline Line */}
                                {dayEvents.length > 1 && (
                                    <div
                                        className="absolute left-3 bg-secondary-200"
                                        style={{
                                            top: '2rem',
                                            bottom: '2rem',
                                            width: '2px'
                                        }}
                                    />
                                )}

                                {/* Events */}
                                <div className="space-y-3">
                                    {dayEvents.map((event, idx) => (
                                        <div key={event.id} className="relative flex gap-2">
                                            {/* Timeline Dot */}
                                            <div className="shrink-0 flex flex-col items-center">
                                                <div className="w-6 h-6 bg-secondary-400 rounded-full flex items-center justify-center z-10 shadow-sm">
                                                    <span className="text-xs font-bold text-white">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Event Card */}
                                            <div className="flex-1 pt-0.5 min-w-0">
                                                <div
                                                    onClick={() => selectPlaceFromEvent(event.id)}
                                                    className="bg-surface-100 rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-neutral-400 text-sm truncate">
                                                                {event.place_details.name}
                                                            </h4>
                                                            <p className="text-xs text-neutral-200 truncate">
                                                                {event.place_details.address}
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                                <span className="inline-flex items-center px-2 py-0.5 bg-secondary-200 text-secondary-700 rounded-full text-xs font-medium capitalize">
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
