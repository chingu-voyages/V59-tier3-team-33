'use client';

import { FaCalendarDay, FaHotel, FaEdit } from 'react-icons/fa';
import { useTripStore } from '@/store/tripStore';
import { PlaceCard } from '@/components/PlaceCard';
import { LodgingCard } from '@/components/LodgingCard';
import { useRouter } from 'next/navigation';

interface DayTabProps {
    dayNumber: number;
    date: string;
}

export function DayTab({ dayNumber, date }: DayTabProps) {
    const router = useRouter();
    const {
        trip,
        tripDaysById,
        eventsByDayId,
        eventsById,
        lodgingsByDayId,
        lodgingsById,
        selectPlaceFromEvent,
        selectPlaceFromLodging,
    } = useTripStore();

    // Find the trip day for this date
    const tripDay = Object.values(tripDaysById).find((day) => day.date === date);
    const eventIds = tripDay ? eventsByDayId[tripDay.id] || [] : [];
    const events = eventIds.map(id => eventsById[id]).sort((a, b) => a.position - b.position);

    // Get lodgings for this day
    const lodgingIds = tripDay ? lodgingsByDayId[tripDay.id] || [] : [];
    const lodgings = lodgingIds.map(id => lodgingsById[id]);

    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    const hasContent = events.length > 0 || lodgings.length > 0;

    if (!hasContent) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                    <FaCalendarDay className="text-3xl text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-400 mb-1">
                    Day {dayNumber}
                </h3>
                <p className="text-neutral-200 text-sm mb-4">{displayDate}</p>
                <p className="text-neutral-300 font-medium mb-1">No plans yet</p>
                <p className="text-neutral-200 text-sm">
                    Search and add places to this day
                </p>
            </div>
        );
    }

    const handleEditClick = () => {
        if (trip) {
            // Navigate to edit page with the day index
            router.push(`/trips/${trip.id}/edit?day=${dayNumber - 1}`);
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Day Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-400">
                            Day {dayNumber}
                        </h3>
                        <p className="text-sm text-neutral-200">{displayDate}</p>
                        <p className="text-xs text-neutral-300 mt-1">
                            {lodgings.length > 0 && `${lodgings.length} ${lodgings.length === 1 ? 'lodging' : 'lodgings'}`}
                            {lodgings.length > 0 && events.length > 0 && ' • '}
                            {events.length > 0 && `${events.length} ${events.length === 1 ? 'event' : 'events'}`}
                        </p>
                    </div>
                    {events.length > 0 && (
                        <button
                            onClick={handleEditClick}
                            className="p-2 text-primary-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit day itinerary"
                        >
                            <FaEdit className="text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Lodgings Section */}
            {lodgings.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                        <FaHotel />
                        <span>Accommodation</span>
                    </div>
                    {lodgings.map((lodging) => (
                        <LodgingCard
                            key={lodging.id}
                            lodging={lodging}
                            onClick={() => selectPlaceFromLodging(lodging.id)}
                        />
                    ))}
                </div>
            )}

            {/* Events Section with Timeline */}
            {events.length > 0 && (
                <div className="space-y-3">
                    {lodgings.length > 0 && (
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mt-4">
                            <FaCalendarDay />
                            <span>Events</span>
                        </div>
                    )}

                    <div className="relative">
                        {/* Vertical Timeline Line */}
                        {events.length > 1 && (
                            <div
                                className="absolute left-4 top-12 bottom-12 w-0.5 bg-secondary-200"
                                style={{
                                    top: '3rem',
                                    bottom: '3rem'
                                }}
                            />
                        )}

                        {/* Events */}
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <div key={event.id} className="relative flex gap-3">
                                    {/* Timeline Dot */}
                                    <div className="shrink-0 flex flex-col items-center">
                                        <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center z-10 shadow-md">
                                            <span className="text-xs font-bold text-white">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Event Card */}
                                    <div className="flex-1 pt-0.5">
                                        <PlaceCard
                                            data={event}
                                            type="event"
                                            onClick={() => selectPlaceFromEvent(event.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
