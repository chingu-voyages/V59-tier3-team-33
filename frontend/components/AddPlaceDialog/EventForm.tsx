'use client';

import { useState } from 'react';
import { FaRobot, FaClock } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TripDay } from '@/types/trip';

interface EventFormProps {
    tripDays: TripDay[];
    tripStartDate: string;
    tripEndDate: string;
    onSubmit: (data: EventFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export interface EventFormData {
    date: string; // YYYY-MM-DD
    start_time: string;
    duration: number;
    type: 'ACTIVITY' | 'TRANSPORT' | 'MEAL' | 'OTHER';
    notes: string;
}

export function EventForm({
    tripDays,
    tripStartDate,
    tripEndDate,
    onSubmit,
    onCancel,
    isSubmitting = false
}: EventFormProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [formData, setFormData] = useState({
        start_time: '09:00',
        duration: 60,
        type: 'ACTIVITY' as EventFormData['type'],
        notes: '',
    });

    const minDate = new Date(tripStartDate);
    const maxDate = new Date(tripEndDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) return;

        onSubmit({
            date: format(selectedDate, 'yyyy-MM-dd'),
            ...formData,
        });
    };

    const isValid = selectedDate && formData.start_time && formData.duration > 0;

    // Find which day number this date corresponds to
    const getDayNumber = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayIndex = tripDays.findIndex(day => day.date === dateStr);
        return dayIndex >= 0 ? dayIndex + 1 : null;
    };

    const dayNumber = selectedDate ? getDayNumber(selectedDate) : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* AI Suggestion Placeholder */}
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-2 text-primary-600 mb-1">
                    <FaRobot className="text-lg" />
                    <span className="font-semibold text-sm">AI Suggestion</span>
                    <span className="text-xs px-2 py-0.5 bg-primary-100 rounded-full">Coming Soon</span>
                </div>
                <p className="text-xs text-primary-600">
                    AI will suggest the best time and day for this activity based on your itinerary.
                </p>
            </div>

            {/* Date Selector */}
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Date <span className="text-danger-400">*</span>
                </label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !selectedDate && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                                <span>
                                    {format(selectedDate, 'PPP')}
                                    {dayNumber && <span className="ml-2 text-secondary-600">(Day {dayNumber})</span>}
                                </span>
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => {
                                if (date < minDate || date > maxDate) return true;
                                return false;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-neutral-300 mt-1">
                    Select a date within your trip
                </p>
            </div>

            {/* Start Time */}
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Start Time <span className="text-danger-400">*</span>
                </label>
                <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                    <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 bg-surface-100 border border-surface-500 rounded-lg text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        required
                    />
                </div>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Duration (minutes) <span className="text-danger-400">*</span>
                </label>
                <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-surface-100 border border-surface-500 rounded-lg text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="60"
                    required
                />
            </div>

            {/* Type */}
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Type <span className="text-danger-400">*</span>
                </label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventFormData['type'] })}
                    className="w-full px-3 py-2 bg-surface-100 border border-surface-500 rounded-lg text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                >
                    <option value="ACTIVITY">Activity</option>
                    <option value="MEAL">Dining</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Notes
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-100 border border-surface-500 rounded-lg text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    placeholder="Add notes..."
                    rows={3}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="flex-1 bg-secondary-400 hover:bg-secondary-500 text-neutral"
                >
                    {isSubmitting ? 'Adding...' : 'Add to Itinerary'}
                </Button>
            </div>
        </form>
    );
}
