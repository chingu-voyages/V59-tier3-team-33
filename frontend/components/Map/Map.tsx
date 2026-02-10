'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapProps } from './map.types';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export function Map({
    initialCenter = [-98.5795, 39.8283], // Center of US
    initialZoom = 4,
    className = '',
}: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Prevent multiple initializations
        if (map.current) return;

        // Validate token
        if (!mapboxgl.accessToken) {
            setError('Mapbox token is missing');
            setIsLoading(false);
            return;
        }

        // Validate container
        if (!mapContainer.current) {
            setError('Map container not found');
            setIsLoading(false);
            return;
        }

        try {
            // Initialize map
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: initialCenter,
                zoom: initialZoom,
                attributionControl: false, // We'll add custom attribution
            });

            // Add navigation controls (zoom, compass)
            map.current.addControl(
                new mapboxgl.NavigationControl({
                    showCompass: true,
                    showZoom: true,
                    visualizePitch: true,
                }),
                'top-right'
            );

            // Add fullscreen control
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

            // Add attribution (required by Mapbox)
            map.current.addControl(
                new mapboxgl.AttributionControl({
                    compact: true,
                }),
                'bottom-right'
            );

            // Handle load event
            map.current.on('load', () => {
                setIsLoading(false);
            });

            // Handle errors
            map.current.on('error', (e) => {
                console.error('Mapbox error:', e);
                setError('Failed to load map');
                setIsLoading(false);
            });
        } catch (err) {
            console.error('Map initialization error:', err);
            setError('Failed to initialize map');
            setIsLoading(false);
        }

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [initialCenter, initialZoom]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-600 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-neutral-300 font-medium">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-danger-50 z-10">
                    <div className="text-center p-6 bg-surface-50 rounded-xl shadow-lg max-w-md">
                        <p className="text-danger-400 font-semibold text-lg mb-2">
                            Map Error
                        </p>
                        <p className="text-neutral-300">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
