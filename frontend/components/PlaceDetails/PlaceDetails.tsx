'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaTimes, FaHeart, FaRegHeart, FaStar, FaClock, FaCalendar, FaRobot } from 'react-icons/fa';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import type { PlaceContext } from '@/types/trip';

interface PlaceDetailsProps {
    context: PlaceContext;
    tripId: string;
    onClose: () => void;
    onToggleFavorite: (favoriteId?: string) => Promise<void>;
}

export function PlaceDetails({ context, tripId, onClose, onToggleFavorite }: PlaceDetailsProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { place, isFavorite, isInItinerary, source } = context;

    const handleToggleFavorite = async () => {
        console.log('PlaceDetails: handleToggleFavorite called');
        console.log('PlaceDetails: context:', context);
        console.log('PlaceDetails: isFavorite:', isFavorite);
        console.log('PlaceDetails: favoriteId:', context.favoriteId);

        setIsProcessing(true);
        setError(null);
        try {
            await onToggleFavorite(context.favoriteId);
            console.log('PlaceDetails: onToggleFavorite completed successfully');
        } catch (error) {
            console.error('PlaceDetails: Failed to toggle favorite:', error);
            setError(isFavorite ? 'Failed to remove from favorites' : 'Failed to add to favorites');
            // Clear error after 3 seconds
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddPlace = () => {
        // TODO: Implement add place to itinerary
        console.log('Add place to itinerary:', place);
    };

    return (
        <div className="flex flex-col h-full bg-surface-50">
            {/* Header with Title, Favorite, and Close */}
            <div className="flex items-center justify-between p-4 border-b border-surface-500">
                <h2 className="text-2xl font-bold text-neutral-400 flex-1 truncate pr-2">
                    {place.name}
                </h2>
                <div className="flex items-center gap-2">
                    {/* Only show favorite button if not from event (events are already in itinerary) */}
                    {source !== 'event' && (
                        <button
                            onClick={handleToggleFavorite}
                            disabled={isProcessing}
                            className="p-2 hover:bg-surface-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                            ) : isFavorite ? (
                                <FaHeart className="text-primary-400 text-xl" />
                            ) : (
                                <FaRegHeart className="text-neutral-300 text-xl" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-200 rounded-lg transition-colors"
                        aria-label="Close place details"
                    >
                        <FaTimes className="text-neutral-300 text-xl" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Error Message */}
                {error && (
                    <div className="mx-4 mt-4 p-3 bg-danger-100 border border-danger-300 rounded-lg">
                        <p className="text-sm text-danger-600">{error}</p>
                    </div>
                )}

                {/* Meta Info */}
                <div className="p-4 space-y-2">
                    {/* Status badges */}
                    <div className="flex items-center gap-2 text-sm">
                        {isFavorite && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-400 rounded-full text-xs font-medium">
                                Saved
                            </span>
                        )}
                        {isInItinerary && (
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-400 rounded-full text-xs font-medium">
                                In Itinerary
                            </span>
                        )}
                    </div>

                    {/* Hours Placeholder */}
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <FaClock />
                        <span>Hours not available</span>
                    </div>

                    {/* Booking Info Placeholder */}
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <FaCalendar />
                        <span>Check availability</span>
                    </div>
                </div>

                {/* Add Place Button - only show if not already in itinerary */}
                {!isInItinerary && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={handleAddPlace}
                            className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-secondary-400 text-neutral rounded-xl hover:bg-secondary-500 transition-colors"
                        >
                            <span className="text-xl">+</span>
                            <span>Add Place</span>
                        </button>
                    </div>
                )}

                {/* Image Placeholder */}
                <div className="px-4 pb-4">
                    <div className="w-full h-48 bg-surface-200 border-2 border-surface-500 rounded-xl flex items-center justify-center overflow-hidden">
                        <div className="text-center text-neutral-300">
                            <FaMapMarkerAlt className="text-4xl mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Image not available</p>
                        </div>
                    </div>
                </div>

                {/* Price Placeholder */}
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <FaMapMarkerAlt />
                        <span>Pricing information not available</span>
                    </div>
                </div>

                {/* Accordion Sections */}
                <div className="px-4 pb-4">
                    <Accordion type="single" collapsible className="w-full">
                        {/* AI Suggestion Section */}
                        <AccordionItem value="ai-suggestion">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <FaRobot className="text-primary-400" />
                                    <span className="font-semibold text-neutral-400">AI Suggestion</span>
                                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-400 rounded-full">
                                        Coming Soon
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="pt-2 pb-4 text-sm text-neutral-300">
                                    <p>AI-powered suggestions and recommendations will be available soon.</p>
                                    <p className="mt-2">This feature will provide:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-300">
                                        <li>Best time to visit</li>
                                        <li>Nearby attractions</li>
                                        <li>Travel tips</li>
                                        <li>Local insights</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Location Details Section */}
                        <AccordionItem value="location-details">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <FaMapMarkerAlt className="text-primary-400" />
                                    <span className="font-semibold text-neutral-400">Location Details</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="pt-2 pb-4 space-y-3 text-sm">
                                    <div>
                                        <p className="text-neutral-200 font-medium">Address</p>
                                        <p className="text-neutral-400 mt-1">{place.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-200 font-medium">Coordinates</p>
                                        <p className="text-neutral-400 font-mono text-xs mt-1">
                                            {parseFloat(place.latitude).toFixed(6)}, {parseFloat(place.longitude).toFixed(6)}
                                        </p>
                                    </div>
                                    {place.description && (
                                        <div>
                                            <p className="text-neutral-200 font-medium">Description</p>
                                            <p className="text-neutral-400 mt-1">{place.description}</p>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
