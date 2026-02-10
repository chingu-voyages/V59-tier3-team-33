import { FaCalendarDay, FaMapMarkerAlt } from 'react-icons/fa';

interface DayTabProps {
    dayNumber: number;
    date: string;
}

export function DayTab({ dayNumber, date }: DayTabProps) {
    // Empty state for now - will be populated with places later
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                <FaCalendarDay className="text-3xl text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-400 mb-1">
                Day {dayNumber}
            </h3>
            <p className="text-neutral-200 text-sm mb-4">{date}</p>
            <p className="text-neutral-300 font-medium mb-1">No places added yet</p>
            <p className="text-neutral-200 text-sm">
                Search and assign places to this day
            </p>
        </div>
    );
}
