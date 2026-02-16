'use client';

import { useTripStore } from '@/store/tripStore';
import type { Trip } from '@/types/trip';

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

    return (
        <div className="p-4 space-y-6 overflow-y-auto overflow-x-hidden">
            {tripDays.map((day) => {
                const dayEventIds = eventsByDayId[day.id] || [];
                const dayEvents = dayEventIds
                    .map(id => eventsById[id])
                    .filter(Boolean)
                    .sort((a, b) => a.position - b.position);

                const lodgingIds = lodgingsByDayId[day.id] || [];
                const lodgings = lodgingIds.map(id => lodgingsById[id]).filter(Boolean);

                return (
                    <div key={day.id}>
                        <div className="mb-3">
                            <h3 className="text-lg font-bold text-neutral-400">
                                {formatDate(day.date)}
                            </h3>
                            <p className="text-xs text-neutral-300 mt-1">
                                {lodgings.length > 0 && `${lodgings.length} ${lodgings.length === 1 ? 'lodging' : 'lodgings'}`}
                                {lodgings.length > 0 && dayEvents.length > 0 && ' • '}
                                {dayEvents.length > 0 && `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
                                {lodgings.length === 0 && dayEvents.length === 0 && 'No plans'}
                            </p>
                        </div>

                        {/* Lodgings */}
                        {lodgings.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                    <span>Accommodation</span>
                                </div>
                                <div className="space-y-2">
                                    {lodgings.map((lodging) => (
                                        <div
                                            key={lodging.id}
                                            onClick={() => selectPlaceFromLodging(lodging.id)}
                                            className="bg-surface-100 rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-neutral-400 text-sm truncate">
                                                        {lodging.place_details.name}
                                                    </h4>
                                                    <p className="text-xs text-neutral-200 truncate">
                                                        {lodging.place_details.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events with Timeline */}
                        {dayEvents.length === 0 && lodgings.length === 0 ? (
                            <div className="text-center py-6 bg-surface-100 rounded-xl">
                                <p className="text-sm text-neutral-300">No events for this day</p>
                            </div>
                        ) : dayEvents.length > 0 ? (
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
                                                                <span className="inline-flex items-center px-2 py-0.5 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium capitalize">
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
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
