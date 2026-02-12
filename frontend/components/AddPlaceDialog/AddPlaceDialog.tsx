'use client';

import { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventForm, type EventFormData } from './EventForm';
import { AccommodationForm, type AccommodationFormData } from './AccommodationForm';
import type { Place, TripDay } from '@/types/trip';

interface AddPlaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    place: Place;
    tripId: string;
    tripDays: TripDay[];
    tripStartDate: string;
    tripEndDate: string;
    onSuccess?: () => void;
}

export function AddPlaceDialog({
    open,
    onOpenChange,
    place,
    tripId,
    tripDays,
    tripStartDate,
    tripEndDate,
    onSuccess,
}: AddPlaceDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'event' | 'accommodation'>('event');

    const handleEventSubmit = async (data: EventFormData) => {
        console.log('Event form submitted:', data);
        console.log('Place:', place);
        console.log('Trip ID:', tripId);

        setIsSubmitting(true);

        // TODO: API call will go here
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onOpenChange(false);
            onSuccess?.();
        }, 1000);
    };

    const handleAccommodationSubmit = async (data: AccommodationFormData) => {
        console.log('Accommodation form submitted:', data);
        console.log('Place:', place);
        console.log('Trip ID:', tripId);

        setIsSubmitting(true);

        try {
            // Call store method to add lodging
            const { addLodging } = await import('@/store/tripStore').then(m => m.useTripStore.getState());
            await addLodging(tripId, data, place);

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to add lodging:', error);
            // Keep dialog open on error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-neutral-400">
                        {place.name}
                    </DialogTitle>
                </DialogHeader>

                {/* Image Placeholder */}
                <div className="w-full h-48 bg-surface-200 border-2 border-surface-500 rounded-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center text-neutral-300">
                        <FaMapMarkerAlt className="text-4xl mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Image not available</p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'event' | 'accommodation')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="event">Event</TabsTrigger>
                        <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="event" className="mt-4">
                        <EventForm
                            tripDays={tripDays}
                            tripStartDate={tripStartDate}
                            tripEndDate={tripEndDate}
                            onSubmit={handleEventSubmit}
                            onCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </TabsContent>

                    <TabsContent value="accommodation" className="mt-4">
                        <AccommodationForm
                            tripStartDate={tripStartDate}
                            tripEndDate={tripEndDate}
                            onSubmit={handleAccommodationSubmit}
                            onCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
