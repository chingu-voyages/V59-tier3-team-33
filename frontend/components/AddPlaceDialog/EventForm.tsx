'use client';

import { useState, useMemo } from 'react';
import { FaRobot, FaMagic } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TripDay, Event, Lodging } from '@/types/trip';
import { calculateDistance, DISTANCE_WARNING_THRESHOLD_KM } from '@/utils/distance';
import { api } from '@/lib/api';

interface EventFormProps {
    tripId: string;
    placeName: string;
    tripDays: TripDay[];
    tripStartDate: string;
    tripEndDate: string;
    placeLatitude: string;
    placeLongitude: string;
    eventsByDayId: Record<string, string[]>;
    eventsById: Record<string, Event>;
    lodgingsByDayId: Record<string, string[]>;
    lodgingsById: Record<string, Lodging>;
    onSubmit: (data: EventFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export interface EventFormData {
    date: string; // YYYY-MM-DD
    type: 'FLIGHT' | 'TRAIN' | 'BUS' | 'MEAL' | 'ACTIVITY' | 'OTHER';
    notes: string;
}

export function EventForm({
    tripId,
    placeName,
    tripDays,
    tripStartDate,
    tripEndDate,
    placeLatitude,
    placeLongitude,
    eventsByDayId,
    eventsById,
    lodgingsByDayId,
    lodgingsById,
    onSubmit,
    onCancel,
    isSubmitting = false
}: EventFormProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [formData, setFormData] = useState({
        type: 'ACTIVITY' as EventFormData['type'],
        notes: '',
    });
    const [aiSuggestion, setAiSuggestion] = useState<{
        suggested_date: string;
        suggested_time: string;
        reasoning: string;
        alternative: string;
    } | null>(null);
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

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

    const isValid = selectedDate;

    // Find which day number this date corresponds to
    const getDayNumber = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayIndex = tripDays.findIndex(day => day.date === dateStr);
        return dayIndex >= 0 ? dayIndex + 1 : null;
    };

    const dayNumber = selectedDate ? getDayNumber(selectedDate) : null;

    const distanceWarning = useMemo(() => {
        if (!selectedDate) return null;

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const tripDay = tripDays.find(day => day.date === dateStr);
        if (!tripDay) return null;

        const newPlaceLat = parseFloat(placeLatitude);
        const newPlaceLon = parseFloat(placeLongitude);

        const eventIds = eventsByDayId[tripDay.id] || [];
        const dayEvents = eventIds
            .map(id => eventsById[id])
            .filter(Boolean)
            .sort((a, b) => a.position - b.position);

        const lodgingIds = lodgingsByDayId[tripDay.id] || [];
        const dayLodgings = lodgingIds.map(id => lodgingsById[id]).filter(Boolean);

        let lastLocation: { lat: number; lon: number; name: string } | null = null;

        if (dayEvents.length > 0) {
            const lastEvent = dayEvents[dayEvents.length - 1];
            lastLocation = {
                lat: parseFloat(lastEvent.place_details.latitude),
                lon: parseFloat(lastEvent.place_details.longitude),
                name: lastEvent.place_details.name
            };
        } else if (dayLodgings.length > 0) {
            const lodging = dayLodgings[0];
            lastLocation = {
                lat: parseFloat(lodging.place_details.latitude),
                lon: parseFloat(lodging.place_details.longitude),
                name: lodging.place_details.name
            };
        }

        if (!lastLocation) return null;

        const distance = calculateDistance(
            lastLocation.lat,
            lastLocation.lon,
            newPlaceLat,
            newPlaceLon
        );

        if (distance > DISTANCE_WARNING_THRESHOLD_KM) {
            return {
                distance: Math.round(distance),
                fromLocation: lastLocation.name
            };
        }

        return null;
    }, [selectedDate, tripDays, placeLatitude, placeLongitude, eventsByDayId, eventsById, lodgingsByDayId, lodgingsById]);

    const handleGetAISuggestion = async () => {
        setIsLoadingSuggestion(true);
        setSuggestionError(null);
        setAiSuggestion(null);

        try {
            const itinerary: Record<string, { events: string[]; lodging: string | null }> = {};

            tripDays.forEach(day => {
                const eventIds = eventsByDayId[day.id] || [];
                const events = eventIds
                    .map(id => eventsById[id])
                    .filter(Boolean)
                    .sort((a, b) => a.position - b.position)
                    .map(e => e.place_details.name);

                const lodgingIds = lodgingsByDayId[day.id] || [];
                const lodgings = lodgingIds.map(id => lodgingsById[id]).filter(Boolean);
                const lodging = lodgings.length > 0 ? lodgings[0].place_details.name : null;

                itinerary[day.date] = {
                    events,
                    lodging
                };
            });

            const payload = {
                place_to_schedule: placeName,
                trip_start_date: tripStartDate,
                trip_end_date: tripEndDate,
                itinerary
            };

            const response = await api.post<{
                suggestion: {
                    suggested_date: string;
                    suggested_time: string;
                    reasoning: string;
                    alternative: string;
                }
            }>(`/trips/${tripId}/events/suggest-date/`, payload);
            setAiSuggestion(response.suggestion);
        } catch (error: any) {
            let errorMessage = 'Unable to get AI suggestion. Please try again.';

            if (error.message) {
                const msg = error.message.toLowerCase();
                if (msg.includes('rate limit') || msg.includes('quota') || msg.includes('exhausted')) {
                    errorMessage = 'AI model is temporarily exhausted. Please try again in a few moments.';
                } else if (msg.includes('timeout') || msg.includes('timed out')) {
                    errorMessage = 'Request timed out. Please try again.';
                } else if (msg.includes('network') || msg.includes('fetch')) {
                    errorMessage = 'Network error. Please check your connection.';
                } else if (msg.includes('unauthorized') || msg.includes('401')) {
                    errorMessage = 'Session expired. Please refresh the page.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSuggestionError(errorMessage);
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleApplySuggestion = () => {
        if (!aiSuggestion) return;
        const suggestedDate = new Date(aiSuggestion.suggested_date);
        setSelectedDate(suggestedDate);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* AI Suggestion Button */}
            <div>
                <button
                    type="button"
                    onClick={handleGetAISuggestion}
                    disabled={isLoadingSuggestion}
                    className="w-full px-6 py-3 bg-white border-2 border-teal-500 text-neutral-400 rounded-xl font-semibold transition-all hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isLoadingSuggestion ? (
                        <>
                            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                            <span>Getting Suggestion...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Suggest A Day</span>
                        </>
                    )}
                </button>
            </div>

            {/* AI Suggestion Display */}
            {aiSuggestion && (
                <div className="p-4 bg-surface-100 rounded-lg border border-surface-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <p className="text-base text-neutral-400">
                                <span className="font-bold text-neutral-400">
                                    Day {(() => {
                                        const suggestedDate = new Date(aiSuggestion.suggested_date);
                                        const dayNum = getDayNumber(suggestedDate);
                                        return dayNum || '?';
                                    })()}:
                                </span>
                                <span className="text-neutral-300 ml-1">{aiSuggestion.reasoning}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAiSuggestion(null)}
                            className="text-neutral-300 hover:text-neutral-400 text-lg shrink-0 ml-2"
                        >
                            ✕
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleApplySuggestion}
                        className="w-full px-4 py-2 bg-secondary-400 hover:bg-secondary-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Apply Suggestion
                    </button>
                </div>
            )}

            {/* Error Display */}
            {suggestionError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-lg shrink-0">⚠️</span>
                        <div className="flex-1">
                            <p className="text-sm text-amber-900">{suggestionError}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuggestionError(null)}
                            className="text-amber-600 hover:text-amber-700 text-lg shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

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
                                    {dayNumber && <span className="ml-2 text-primary-600">(Day {dayNumber})</span>}
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
                            defaultMonth={new Date(tripStartDate)}
                            disabled={(date) => {
                                // Normalize dates to midnight for comparison
                                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                                const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

                                return dateOnly < minDateOnly || dateOnly > maxDateOnly;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-neutral-300 mt-1">
                    Select a date within your trip
                </p>
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
                    <option value="MEAL">Meal</option>
                    <option value="FLIGHT">Flight</option>
                    <option value="TRAIN">Train</option>
                    <option value="BUS">Bus</option>
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

            {distanceWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-lg shrink-0">⚠️</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 mb-1">
                                Long Distance Detected
                            </p>
                            <p className="text-xs text-amber-800">
                                This location is <strong>{distanceWarning.distance} km</strong> from "{distanceWarning.fromLocation}".
                                Consider if this is feasible for a single day or if you need to adjust your itinerary.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
