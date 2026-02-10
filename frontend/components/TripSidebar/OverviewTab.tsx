import { FaCalendarAlt, FaClock, FaHeart } from 'react-icons/fa';
import { Trip } from '@/types/trip';
import { formatDateRange } from '@/lib/date-utils';

interface OverviewTabProps {
    trip: Trip;
    favoritesCount: number;
}

export function OverviewTab({ trip, favoritesCount }: OverviewTabProps) {
    const dateRange = formatDateRange(trip.start_date, trip.end_date);

    return (
        <div className="p-6 space-y-6">
            {/* Trip Info Card */}
            <div className="bg-surface-100 rounded-xl p-5 border border-surface-500">
                <h3 className="text-lg font-bold text-neutral-400 mb-4">Trip Details</h3>

                <div className="space-y-4">
                    {/* Dates */}
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-200">Dates</p>
                            <p className="font-semibold text-neutral-400">{dateRange}</p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                            <FaClock className="text-secondary-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-200">Duration</p>
                            <p className="font-semibold text-neutral-400">
                                {trip.total_days} {trip.total_days === 1 ? 'day' : 'days'}
                            </p>
                        </div>
                    </div>

                    {/* Favorites Count */}
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
                            <FaHeart className="text-danger-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-200">Saved Places</p>
                            <p className="font-semibold text-neutral-400">
                                {favoritesCount} {favoritesCount === 1 ? 'place' : 'places'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary-400">{trip.total_days}</p>
                    <p className="text-sm text-neutral-300">Days</p>
                </div>
                <div className="bg-danger-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-danger-400">{favoritesCount}</p>
                    <p className="text-sm text-neutral-300">Favorites</p>
                </div>
            </div>
        </div>
    );
}
