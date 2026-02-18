'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaArrowLeft, FaGripVertical, FaTrash, FaRoute } from 'react-icons/fa';
import { useTripStore } from '@/store/tripStore';
import type { Event } from '@/types/trip';
import { api } from '@/lib/api';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SortableEventItemProps {
    event: Event;
    index: number;
    onDelete: (eventId: string) => void;
}

function SortableEventItem({ event, index, onDelete }: SortableEventItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-400 p-2"
                >
                    <FaGripVertical className="text-lg" />
                </button>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-400 truncate">
                        {event.place_details.name}
                    </h4>
                    <p className="text-sm text-neutral-200 truncate">
                        {event.place_details.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-secondary-200 text-secondary-700 rounded-full text-xs font-medium capitalize">
                            {event.type.toLowerCase()}
                        </span>
                        {event.notes && (
                            <span className="text-xs text-neutral-300 truncate">
                                {event.notes}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => onDelete(event.id)}
                    className="p-2 text-danger-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}

export default function EditItineraryPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;

    const {
        trip,
        tripDaysById,
        tripDayIds,
        eventsByDayId,
        eventsById,
        lodgingsByDayId,
        lodgingsById,
        setTrip,
        setLodgings
    } = useTripStore();

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [localEvents, setLocalEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationStats, setOptimizationStats] = useState<{
        distance: number;
        time: number;
    } | null>(null);
    const [optimizationError, setOptimizationError] = useState<string | null>(null);

    // Fetch trip data if not in store
    useEffect(() => {
        const fetchTripData = async () => {
            if (!trip || trip.id !== tripId) {
                try {
                    const tripData = await api.get(`/trips/${tripId}/`);
                    setTrip(tripData);

                    // Fetch lodgings
                    try {
                        const lodgingsData = await api.get(`/trips/${tripId}/lodgings/`);
                        setLodgings(lodgingsData);
                    } catch (lodgingError) {
                        console.error('Failed to fetch lodgings:', lodgingError);
                        setLodgings([]);
                    }
                } catch (error) {
                    console.error('Failed to fetch trip:', error);
                    alert('Failed to load trip data');
                    router.push('/trips');
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Trip exists, but make sure we have lodgings
                const fetchLodgings = async () => {
                    try {
                        const lodgingsData = await api.get(`/trips/${tripId}/lodgings/`);
                        setLodgings(lodgingsData);
                    } catch (lodgingError) {
                        console.error('Failed to fetch lodgings:', lodgingError);
                        setLodgings([]);
                    }
                };
                fetchLodgings();
                setIsLoading(false);
            }
        };

        fetchTripData();
    }, [tripId, trip, setTrip, setLodgings, router]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const tripDays = tripDayIds.map(id => tripDaysById[id]).filter(Boolean);
    const currentDay = selectedDayIndex >= 0 ? tripDays[selectedDayIndex] : null;
    const currentDayId = currentDay?.id;

    useEffect(() => {
        if (currentDayId) {
            const eventIds = eventsByDayId[currentDayId] || [];
            const events = eventIds
                .map(id => eventsById[id])
                .filter(Boolean)
                .sort((a, b) => a.position - b.position);
            setLocalEvents(events);
        }
    }, [currentDayId, eventsByDayId, eventsById]);

    useEffect(() => {
        setHasChanges(false);
        setOptimizationStats(null);
        setOptimizationError(null);
    }, [selectedDayIndex]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalEvents((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            setHasChanges(true);
        }
    };

    const handleDeleteClick = (eventId: string) => {
        setEventToDelete(eventId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/trips/${tripId}/events/${eventToDelete}/`);

            const tripData = await api.get(`/trips/${tripId}/`);
            setTrip(tripData);

            setDeleteDialogOpen(false);
            setEventToDelete(null);
        } catch (error) {
            alert('Failed to delete event. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async () => {
        if (!currentDayId || !hasChanges || localEvents.length === 0) return;

        setIsSaving(true);
        try {
            const eventIds = localEvents.map(e => e.id);

            const payload = {
                trip_day_id: currentDayId,
                event_ids: eventIds
            };

            await api.post(`/trips/${tripId}/events/reorder/`, payload);

            const tripData = await api.get(`/trips/${tripId}/`);
            setTrip(tripData);

            router.push(`/trips/${tripId}`);
        } catch (error) {
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptimizeRoute = async () => {
        if (!currentDayId || localEvents.length < 2) {
            return;
        }

        setIsOptimizing(true);
        setOptimizationError(null);
        try {
            const response = await api.post(`/trips/${tripId}/events/optimize-route/`, {
                trip_day_id: currentDayId
            });

            const orderedIds = response.ordered_ids;

            if (!orderedIds || !Array.isArray(orderedIds)) {
                throw new Error('Unable to process optimization results. Please try again.');
            }

            if (orderedIds.length !== localEvents.length) {
                throw new Error(`Could not optimize all ${localEvents.length} locations. Only ${orderedIds.length} were processed. One or more locations may be inaccessible by road.`);
            }

            const optimizedEvents = orderedIds
                .map((id: string) => localEvents.find(e => e.id === id))
                .filter(Boolean) as Event[];

            if (optimizedEvents.length !== localEvents.length) {
                throw new Error('Some locations could not be matched. Please try again or adjust your itinerary.');
            }

            setLocalEvents(optimizedEvents);
            setHasChanges(true);

            setOptimizationStats({
                distance: response.total_distance_km,
                time: response.total_time_hours
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Unable to optimize this route. Try removing locations that may be in water, restricted areas, or adjusting the order manually.';
            setOptimizationError(errorMessage);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDayChange = (index: number) => {
        if (hasChanges) {
            const confirm = window.confirm('You have unsaved changes. Do you want to discard them?');
            if (!confirm) return;
        }
        setSelectedDayIndex(index);
    };

    if (isLoading || !trip) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-surface-400 bg-[url('/auth_background.png')] bg-cover">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/trips/${tripId}`)}
                            className="text-neutral-400 hover:text-neutral-500 transition-colors"
                        >
                            <FaArrowLeft className="text-2xl" />
                        </button>
                        <h1 className="text-3xl font-bold text-neutral-400">Edit Itinerary</h1>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="px-8 py-3 bg-secondary-400 text-white rounded-2xl font-semibold hover:bg-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedDayIndex(-1)}
                        className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${selectedDayIndex === -1
                            ? 'bg-primary-400 text-white shadow-md'
                            : 'bg-white text-neutral-300 hover:bg-surface-100'
                            }`}
                    >
                        Overview
                    </button>
                    {tripDays.map((day, index) => (
                        <button
                            key={day.id}
                            onClick={() => handleDayChange(index)}
                            className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${selectedDayIndex === index
                                ? 'bg-primary-400 text-white shadow-md'
                                : 'bg-white text-neutral-300 hover:bg-surface-100'
                                }`}
                        >
                            Day {index + 1}
                        </button>
                    ))}
                </div>

                {selectedDayIndex === -1 && (
                    <div className="space-y-8">
                        {tripDays.map((day, index) => {
                            const dayEventIds = eventsByDayId[day.id] || [];
                            const dayEvents = dayEventIds
                                .map(id => eventsById[id])
                                .filter(Boolean)
                                .sort((a, b) => a.position - b.position);

                            const lodgingIds = lodgingsByDayId[day.id] || [];
                            const lodgings = lodgingIds.map(id => lodgingsById[id]).filter(Boolean);

                            return (
                                <div key={day.id}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-400">
                                                {formatDate(day.date)}
                                            </h3>
                                            <p className="text-sm text-neutral-300 mt-1">
                                                {lodgings.length > 0 && `${lodgings.length} ${lodgings.length === 1 ? 'lodging' : 'lodgings'}`}
                                                {lodgings.length > 0 && dayEvents.length > 0 && ' • '}
                                                {dayEvents.length > 0 && `${dayEvents.length} ${dayEvents.length === 1 ? 'event' : 'events'}`}
                                                {lodgings.length === 0 && dayEvents.length === 0 && 'No plans'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDayChange(index)}
                                            className="text-sm text-primary-400 hover:text-primary-500 font-medium px-4 py-2 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            Edit Day
                                        </button>
                                    </div>

                                    {/* Lodgings */}
                                    {lodgings.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-3">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                </svg>
                                                <span>Accommodation</span>
                                            </div>
                                            <div className="space-y-3">
                                                {lodgings.map((lodging) => (
                                                    <div key={lodging.id} className="bg-white rounded-xl p-4 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-neutral-400 truncate">
                                                                    {lodging.place_details.name}
                                                                </h4>
                                                                <p className="text-sm text-neutral-200 truncate">
                                                                    {lodging.place_details.address}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                                                                        {formatDate(lodging.arrival_date)} - {formatDate(lodging.departure_date)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {dayEvents.length === 0 && lodgings.length === 0 ? (
                                        <div className="text-center py-8 bg-surface-100 rounded-xl">
                                            <p className="text-neutral-300">No events for this day</p>
                                        </div>
                                    ) : dayEvents.length > 0 ? (
                                        <div className="relative">
                                            {/* Vertical Timeline Line */}
                                            {dayEvents.length > 1 && (
                                                <div
                                                    className="absolute left-4 bg-secondary-200"
                                                    style={{
                                                        top: '3rem',
                                                        bottom: '3rem',
                                                        width: '2px'
                                                    }}
                                                />
                                            )}

                                            {/* Events */}
                                            <div className="space-y-4">
                                                {dayEvents.map((event, idx) => (
                                                    <div key={event.id} className="relative flex gap-3">
                                                        {/* Timeline Dot */}
                                                        <div className="shrink-0 flex flex-col items-center">
                                                            <div className="w-8 h-8 bg-secondary-400 rounded-full flex items-center justify-center z-10 shadow-md">
                                                                <span className="text-xs font-bold text-white">
                                                                    {idx + 1}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Event Card */}
                                                        <div className="flex-1 pt-0.5">
                                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-semibold text-neutral-400 truncate">
                                                                            {event.place_details.name}
                                                                        </h4>
                                                                        <p className="text-sm text-neutral-200 truncate">
                                                                            {event.place_details.address}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className="inline-flex items-center px-2 py-1 bg-secondary-200 text-secondary-700 rounded-full text-xs font-medium capitalize">
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
                )}

                {selectedDayIndex >= 0 && currentDay && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-400">
                                    {formatDate(currentDay.date)}
                                </h2>
                            </div>
                            <button
                                onClick={handleOptimizeRoute}
                                disabled={isOptimizing || localEvents.length < 2}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl hover:bg-surface-100 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOptimizing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Optimizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaRoute />
                                        <span>Optimize Route</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {optimizationError && (
                            <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-5 h-5 text-danger-600 mt-0.5">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-danger-800 mb-1">Unable to Optimize Route</h4>
                                        <p className="text-xs text-danger-600">
                                            Common causes: locations in water or restricted areas, extreme distances between points, or insufficient routing data for the region.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setOptimizationError(null)}
                                        className="shrink-0 text-danger-600 hover:text-danger-800 text-lg leading-none"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Optimization Stats Banner */}
                        {optimizationStats && (
                            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-primary-600 font-medium">Total Distance</p>
                                            <p className="text-lg font-bold text-primary-700">{optimizationStats.distance.toFixed(1)} km</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-primary-600 font-medium">Total Time</p>
                                            <p className="text-lg font-bold text-primary-700">{optimizationStats.time.toFixed(1)} hrs</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setOptimizationStats(null)}
                                        className="text-primary-600 hover:text-primary-700 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Lodgings Section */}
                        {(() => {
                            const lodgingIds = lodgingsByDayId[currentDayId] || [];
                            const lodgings = lodgingIds.map(id => lodgingsById[id]).filter(Boolean);

                            if (lodgings.length > 0) {
                                return (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-3">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                            </svg>
                                            <span>Accommodation</span>
                                        </div>
                                        <div className="space-y-3">
                                            {lodgings.map((lodging) => (
                                                <div key={lodging.id} className="bg-white rounded-xl p-4 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-neutral-400 truncate">
                                                                {lodging.place_details.name}
                                                            </h4>
                                                            <p className="text-sm text-neutral-200 truncate">
                                                                {lodging.place_details.address}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                                                                    {formatDate(lodging.arrival_date)} - {formatDate(lodging.departure_date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {localEvents.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-neutral-300 mb-2">No events for this day</p>
                                <p className="text-sm text-neutral-200">
                                    Add events from the trip page
                                </p>
                            </div>
                        ) : !isMounted ? (
                            <div className="space-y-4">
                                {localEvents.map((event) => (
                                    <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="text-neutral-300 p-2">
                                                <FaGripVertical className="text-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-neutral-400 truncate">
                                                    {event.place_details.name}
                                                </h4>
                                                <p className="text-sm text-neutral-200 truncate">
                                                    {event.place_details.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localEvents.map(e => e.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-4">
                                        {localEvents.map((event, index) => (
                                            <SortableEventItem
                                                key={event.id}
                                                event={event}
                                                index={index}
                                                onDelete={handleDeleteClick}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-danger-600 hover:bg-danger-700 focus:ring-danger-600"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
