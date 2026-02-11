'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap } from 'react-leaflet';
import type { MapProps } from './map.types';
import L from 'leaflet';
import { MapSearch } from './MapSearch';
import type { NominatimResult } from '@/services/nominatim';

// Fix for default marker icons - use CDN URLs instead of imports
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view changes with smooth fly animation
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    const prevCenter = useRef<[number, number]>(center);

    useEffect(() => {
        console.log('MapViewController: center changed to', center, 'zoom:', zoom);
        console.log('MapViewController: prev center was', prevCenter.current);

        // Only fly if the center has actually changed
        if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
            console.log('MapViewController: Flying to new location');
            map.flyTo(center, zoom, {
                duration: 2, // Animation duration in seconds
                easeLinearity: 0.25, // Smoothness of the animation
            });
            prevCenter.current = center;
        } else {
            console.log('MapViewController: Center unchanged, skipping fly');
        }
    }, [center, zoom, map]);

    return null;
}

// Animated marker component
// Animated marker component
function AnimatedMarker({ position, displayName }: { position: [number, number]; displayName: string }) {
    const markerRef = useRef<L.Marker>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for marker to be fully mounted
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isReady || !markerRef.current) return;

        const marker = markerRef.current;

        // Add drop animation
        const icon = marker.getElement();
        if (icon) {
            icon.style.animation = 'markerDrop 0.6s ease-out';
        }

        // Open popup after animation completes
        const popupTimer = setTimeout(() => {
            try {
                marker.openPopup();
            } catch (error) {
                console.error('Error opening popup:', error);
            }
        }, 600);

        return () => clearTimeout(popupTimer);
    }, [isReady]);

    return (
        <Marker
            ref={markerRef}
            position={position}
            icon={DefaultIcon}
        >
            <Popup>
                <div className="text-sm">
                    <div className="font-semibold">{displayName.split(',')[0]}</div>
                    <div className="text-gray-600 text-xs mt-1">{displayName}</div>
                </div>
            </Popup>
        </Marker>
    );
}

export function Map({
    initialCenter = [39.8283, -98.5795], // Center of US [lat, lng]
    initialZoom = 4,
    className = '',
    showSearch = false,
    onLocationSelect,
    selectedLocation: externalSelectedLocation,
}: MapProps) {
    const [internalSelectedLocation, setInternalSelectedLocation] = useState<NominatimResult | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>(
        Array.isArray(initialCenter) ? initialCenter as [number, number] : [39.8283, -98.5795]
    );
    const [mapZoom, setMapZoom] = useState(initialZoom);

    // Use external location if provided, otherwise use internal
    const selectedLocation = externalSelectedLocation !== undefined ? externalSelectedLocation : internalSelectedLocation;

    // Update map when selected location changes
    useEffect(() => {
        if (selectedLocation) {
            const lat = parseFloat(selectedLocation.lat);
            const lon = parseFloat(selectedLocation.lon);
            setMapCenter([lat, lon]);
            setMapZoom(13);
        }
    }, [selectedLocation]);

    const handleLocationSelect = (result: NominatimResult) => {
        // Update internal state if not controlled
        if (externalSelectedLocation === undefined) {
            setInternalSelectedLocation(result);
        }

        // Call parent callback if provided
        if (onLocationSelect) {
            onLocationSelect(result);
        }
    };
    // Define world bounds to prevent panning beyond map edges
    const maxBounds: L.LatLngBoundsExpression = [
        [-90, -180], // Southwest coordinates
        [90, 180]    // Northeast coordinates
    ];

    return (
        <div className={`relative w-full h-full ${className}`} style={{ zIndex: 0 }}>
            {/* Search Bar - Only show if showSearch is true */}
            {showSearch && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[1000]">
                    <MapSearch onLocationSelect={handleLocationSelect} />
                </div>
            )}

            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                minZoom={4} // Prevent zooming out too far (stops repetition)
                maxZoom={19}
                maxBounds={maxBounds} // Restrict panning to world bounds
                maxBoundsViscosity={1.0} // Make bounds "hard" (can't pan beyond)
                zoomControl={false} // We'll add custom positioned controls
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ background: '#e5e7eb', zIndex: 0 }}
            >
                {/* OpenStreetMap Tile Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    minZoom={2}
                    maxZoom={19}
                    noWrap={true} // Prevent map from repeating horizontally
                    bounds={maxBounds} // Apply same bounds to tiles
                />

                {/* Zoom Controls (positioned bottom-left) */}
                <ZoomControl position="bottomleft" />

                {/* Map View Controller */}
                <MapViewController center={mapCenter} zoom={mapZoom} />

                {/* Selected Location Marker with animation */}
                {selectedLocation && (
                    <AnimatedMarker
                        key={`${selectedLocation.lat}-${selectedLocation.lon}`}
                        position={[parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]}
                        displayName={selectedLocation.display_name}
                    />
                )}
            </MapContainer>
        </div>
    );
}
