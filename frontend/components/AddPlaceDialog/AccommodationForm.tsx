'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface AccommodationFormProps {
    tripStartDate: string;
    tripEndDate: string;
    onSubmit: (data: AccommodationFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export interface AccommodationFormData {
    arrival_date: string;
    departure_date: string;
}

export function AccommodationForm({
    tripStartDate,
    tripEndDate,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: AccommodationFormProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const minDate = new Date(tripStartDate);
    const maxDate = new Date(tripEndDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateRange?.from || !dateRange?.to) return;

        onSubmit({
            arrival_date: format(dateRange.from, 'yyyy-MM-dd'),
            departure_date: format(dateRange.to, 'yyyy-MM-dd'),
        });
    };

    const isValid = dateRange?.from && dateRange?.to;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Range Selector */}
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Check-in & Check-out <span className="text-danger-400">*</span>
                </label>
                <div className="border border-surface-500 rounded-lg p-3 bg-surface-100">
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        disabled={(date) => {
                            // Normalize dates to midnight for accurate comparison
                            const normalizedDate = new Date(date);
                            normalizedDate.setHours(0, 0, 0, 0);

                            const normalizedMin = new Date(minDate);
                            normalizedMin.setHours(0, 0, 0, 0);

                            const normalizedMax = new Date(maxDate);
                            normalizedMax.setHours(0, 0, 0, 0);

                            if (normalizedDate < normalizedMin || normalizedDate > normalizedMax) return true;
                            return false;
                        }}
                        numberOfMonths={1}
                        className="mx-auto"
                    />
                </div>
                <div className="mt-2 space-y-1">
                    {dateRange?.from && (
                        <p className="text-sm text-neutral-400">
                            <span className="font-medium">Check-in:</span> {format(dateRange.from, 'PPP')}
                        </p>
                    )}
                    {dateRange?.to && (
                        <p className="text-sm text-neutral-400">
                            <span className="font-medium">Check-out:</span> {format(dateRange.to, 'PPP')}
                        </p>
                    )}
                    {!dateRange?.from && (
                        <p className="text-xs text-neutral-300">
                            Select your check-in and check-out dates
                        </p>
                    )}
                </div>
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
                    {isSubmitting ? 'Adding...' : 'Add Accommodation'}
                </Button>
            </div>
        </form>
    );
}
