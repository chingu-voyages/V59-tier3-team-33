'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaTimes, FaHeart, FaRegHeart, FaStar, FaClock, FaCalendar, FaRobot } from 'react-icons/fa';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import type { NominatimResult } from '@/services/nominatim';

interface PlaceDetailsProps {
    place: NominatimResult;
    onClose: () => void;
}

export function PlaceDetails({ place, onClose }: PlaceDetailsProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // TODO: Implement save/remove from favorites
        console.log('Toggle favorite:', place);
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
                    {place.display_name.split(',')[0]}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleFavorite}
                        className="p-2 hover:bg-surface-200 rounded-lg transition-colors"
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isFavorite ? (
                            <FaHeart className="text-primary-400 text-xl" />
                        ) : (
                            <FaRegHeart className="text-neutral-300 text-xl" />
                        )}
                    </button>
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
                {/* Meta Info */}
                <div className="p-4 space-y-2">
                    {/* Rating & Category */}
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                            <FaStar className="text-secondary-400" />
                            <span className="font-semibold text-neutral-400">
                                {place.importance.toFixed(1)}
                            </span>
                            <span className="text-neutral-200">
                                ({place.place_id})
                            </span>
                        </div>
                        <span className="text-neutral-300 capitalize">
                            {place.type.replace('_', ' ')}
                        </span>
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

                {/* Add Place Button */}
                <div className="px-4 pb-4">
                    <button
                        onClick={handleAddPlace}
                        className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-secondary-400 text-neutral rounded-xl hover:bg-secondary-500 transition-colors"
                    >
                        <span className="text-xl">+</span>
                        <span>Add Place</span>
                    </button>
                </div>

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
                                        <p className="text-neutral-400 mt-1">{place.display_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-200 font-medium">Coordinates</p>
                                        <p className="text-neutral-400 font-mono text-xs mt-1">
                                            {parseFloat(place.lat).toFixed(6)}, {parseFloat(place.lon).toFixed(6)}
                                        </p>
                                    </div>
                                    {place.address && (
                                        <>
                                            {place.address.city && (
                                                <div>
                                                    <p className="text-neutral-200 font-medium">City</p>
                                                    <p className="text-neutral-400 mt-1">{place.address.city}</p>
                                                </div>
                                            )}
                                            {place.address.state && (
                                                <div>
                                                    <p className="text-neutral-200 font-medium">State</p>
                                                    <p className="text-neutral-400 mt-1">{place.address.state}</p>
                                                </div>
                                            )}
                                            {place.address.country && (
                                                <div>
                                                    <p className="text-neutral-200 font-medium">Country</p>
                                                    <p className="text-neutral-400 mt-1">{place.address.country}</p>
                                                </div>
                                            )}
                                        </>
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
