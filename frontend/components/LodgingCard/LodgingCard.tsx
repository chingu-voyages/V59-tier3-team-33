'use client';

import { FaHotel } from 'react-icons/fa';
import { format } from 'date-fns';
import type { Lodging } from '@/types/trip';

interface LodgingCardProps {
    lodging: Lodging;
    onClick: () => void;
}

export function LodgingCard({ lodging, onClick }: LodgingCardProps) {
    const { place_details, arrival_date, departure_date } = lodging;

    const checkIn = format(new Date(arrival_date), 'MMM d');
    const checkOut = format(new Date(departure_date), 'MMM d');

    return (
        <div
            onClick={onClick}
            className="p-4 bg-primary-50 border border-primary-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
        >
            <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 bg-primary-400 rounded-lg flex items-center justify-center">
                    <FaHotel className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-neutral-400 font-semibold truncate">
                        {place_details.name}
                    </h3>
                    <p className="text-sm text-neutral-200 truncate">
                        {place_details.address}
                    </p>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                            {checkIn} - {checkOut}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
