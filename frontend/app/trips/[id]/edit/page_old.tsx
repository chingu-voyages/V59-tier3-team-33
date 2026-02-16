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
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-400 p-2"
                >
                    <FaGripVertical className="text-lg" />
                </button>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-400 truncate">
                        {event.place_details.name}
                    </h4>
                    <p className="text-sm text-neutral-200 truncate">
                        {event.place_details.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium capitalize">
                            {event.type.toLowerCase()}
                        </span>
                        {event.notes && (
                            <span className="text-xs text-neutral-300 truncate">
                                {event.notes}
                            </span>
                        )}
                    </div>
                </div>

                {/* Delete Button */}
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

    const { trip, tripDaysById, eventsByDayId, eventsById, setTrip } = useTripStore();

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [localEvents, setLocalEvents] = useState<Event[]>([]);

    // Prevent hydration mismatch with drag-and-drop
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get trip days
    const tripDays = trip?.trip_days || [];
    const currentDay = selectedDayIndex >= 0 ? tripDays[selectedDayIndex] : null;
    const currentDayId = currentDay?.id;

    // Load events for selected day
    useEffect(() => {
        if (currentDayId) {
            const eventIds = eventsByDayId[currentDayId] || [];
            const events = eventIds
                .map(id => eventsById[id])
                .filter(Boolean)
                .sort((a, b) => a.position - b.position);
            setLocalEvents(events);
            setHasChanges(false);
        }
    }, [currentDayId, eventsByDayId, eventsById]);

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

            // Remove from local state
            setLocalEvents(prev => prev.filter(e => e.id !== eventToDelete));
            setHasChanges(true);
            setDeleteDialogOpen(false);
            setEventToDelete(null);
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async () => {
        if (!currentDayId || !hasChanges) return;

        setIsSaving(true);
        try {
            // TODO: Call reorder API endpoint
            const eventIds = localEvents.map(e => e.id);
            console.log('Saving order for day:', currentDayId, 'Event IDs:', eventIds);

            // await api.patch(`/trips/${tripId}/trip-days/${currentDayId}/events/reorder/`, {
            //   event_ids: eventIds
            // });

            // Refetch trip data
            const tripData = await api.get(`/trips/${tripId}/`);
            setTrip(tripData);

            alert('Changes saved! (Reorder endpoint not integrated yet)');
            router.push(`/trips/${tripId}`);
        } catch (error) {
            console.error('Failed to save changes:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptimizeRoute = () => {
        alert('Route optimization coming soon!');
    };

    const handleDayChange = (index: number) => {
        if (hasChanges) {
            const confirm = window.confirm('You have unsaved changes. Do you want to discard them?');
            if (!confirm) return;
        }
        setSelectedDayIndex(index);
    };

    if (!trip) {
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
                {/* Header */}
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
                        disabled={!hasChanges}
                        className="px-8 py-3 bg-secondary-400 text-white rounded-2xl font-semibold hover:bg-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        Save
                    </button>
                </div>

                {/* Day Tabs - Pill Shape */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedDayIndex(-1)}
                        className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${selectedDayIndex === -1
                            ? 'bg-primary-50 text-primary shadow-md'
                            : 'bg-white text-neutral-300 hover:bg-surface-100'
                            }`}
                    >
                        Overview
                    </button>
                    {dummyDays.map((day, index) => (
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

                {/* Overview Tab (Read-only) */}
                {selectedDayIndex === -1 && (
                    <div className="space-y-6">
                        <p className="text-neutral-300 text-center py-8">
                            Select a day to edit its events
                        </p>
                        {dummyDays.map((day, index) => (
                            <div key={day.id} className="border-b border-surface-300 pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-neutral-400 text-lg">
                                        {day.date}
                                    </h3>
                                    <button
                                        onClick={() => handleDayChange(index)}
                                        className="text-sm text-primary-400 hover:text-primary-500 font-medium"
                                    >
                                        Edit Day
                                    </button>
                                </div>
                                {day.events.length === 0 ? (
                                    <p className="text-sm text-neutral-300">No events</p>
                                ) : (
                                    <div className="space-y-2">
                                        {day.events.map((event, idx) => (
                                            <div key={event.id} className="flex items-center gap-2 text-sm">
                                                <span className="text-neutral-300">{idx + 1}.</span>
                                                <span className="text-neutral-400">{event.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Day Edit Tab */}
                {selectedDayIndex >= 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-400">
                                    {dummyDays[selectedDayIndex].date}
                                </h2>
                                <p className="text-sm text-neutral-300 mt-1">
                                    Est. Exploration Time: 30min - 2hr 15 min
                                </p>
                            </div>
                            <button
                                onClick={handleOptimizeRoute}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-xl hover:bg-surface-100 transition-colors font-medium shadow-sm"
                            >
                                <FaRoute />
                                <span>Optimize Route</span>
                            </button>
                        </div>

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
                                                    {event.name}
                                                </h4>
                                                <p className="text-sm text-neutral-200 truncate">
                                                    {event.address}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-danger-600 hover:bg-danger-700 focus:ring-danger-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
