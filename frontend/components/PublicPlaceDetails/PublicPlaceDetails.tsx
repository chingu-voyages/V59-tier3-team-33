'use client';

import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import type { Place } from '@/types/trip';

interface PublicPlaceDetailsProps {
    place: Place;
    onClose: () => void;
}

export function PublicPlaceDetails({ place, onClose }: PublicPlaceDetailsProps) {
    return (
        <div className="flex flex-col h-full bg-surface-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-500">
                <h2 className="text-xl font-bold text-neutral-400">Place Details</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-surface-200 rounded-lg transition-colors"
                    aria-label="Close"
                >
                    <FaTimes className="text-neutral-300" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Place Name */}
                <div>
                    <h3 className="text-2xl font-bold text-neutral-400 mb-2">
                        {place.name}
                    </h3>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-4 bg-surface-100 rounded-xl">
                    <FaMapMarkerAlt className="text-primary-400 text-xl mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-400 mb-1">Address</p>
                        <p className="text-sm text-neutral-300 break-words">
                            {place.address}
                        </p>
                    </div>
                </div>

                {/* Coordinates */}
                <div className="p-4 bg-surface-100 rounded-xl">
                    <p className="text-sm font-medium text-neutral-400 mb-2">Coordinates</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-neutral-300 mb-1">Latitude</p>
                            <p className="text-sm text-neutral-400 font-mono">
                                {parseFloat(place.latitude).toFixed(6)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-300 mb-1">Longitude</p>
                            <p className="text-sm text-neutral-400 font-mono">
                                {parseFloat(place.longitude).toFixed(6)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description (if available) */}
                {place.description && (
                    <div className="p-4 bg-surface-100 rounded-xl">
                        <p className="text-sm font-medium text-neutral-400 mb-2">Description</p>
                        <p className="text-sm text-neutral-300">
                            {place.description}
                        </p>
                    </div>
                )}

                {/* Info Banner */}
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                    <p className="text-sm text-primary-700">
                        This is a shared trip. Create your own account to save places and plan your own trips!
                    </p>
                </div>
            </div>
        </div>
    );
}
