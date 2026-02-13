'use client';

import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import type { SavedPlace, Event } from '@/types/trip';

interface PlaceCardProps {
    data: SavedPlace | Event;
    type: 'favorite' | 'event';
    onClick: () => void;
}

// Format time from HH:mm:ss.microseconds to human-readable format
function formatTime(timeString: string): string {
    try {
        // Extract HH:mm from the time string
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeString;
    }
}

export function PlaceCard({ data, type, onClick }: PlaceCardProps) {
    // Both SavedPlace and Event have place_details
    const place = data.place_details;
    const event = type === 'event' ? (data as Event) : null;

    return (
        <div
            onClick={onClick}
            className="w-full max-w-full p-4 bg-surface-100 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
        >
            <div className="flex gap-3 items-center min-w-0">
                <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt className="text-primary-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-neutral-400 font-semibold text-pretty">
                        {place.name}
                    </h3>
                    <p className="text-xs text-neutral-200 text-pretty">
                        {place.address}
                    </p>

                    {/* Show event details if it's an event */}
                    {event && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {event.start_time && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium">
                                    <FaClock />
                                    {formatTime(event.start_time)}
                                </span>
                            )}
                            {event.duration > 0 && (
                                <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium">
                                    {event.duration} min
                                </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium capitalize">
                                {event.type.toLowerCase().replace('_', ' ')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
