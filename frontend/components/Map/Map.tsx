'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { MapProps } from './map.types';
import L from 'leaflet';
import { MapSearch } from './MapSearch';
import type { NominatimResult } from '@/services/nominatim';

// Custom primary color marker icon (larger size) - for events
const PrimaryIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="52">
            <path fill="#f59e0b" stroke="#f59e0b" stroke-width="2" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
            <circle cx="12" cy="9" r="3.5" fill="white"/>
        </svg>
    `),
    iconSize: [32, 52],
    iconAnchor: [16, 52],
    popupAnchor: [1, -44],
});

// Lodging marker icon (green color)
const LodgingIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="52">
            <path fill="#10b981" stroke="#059669" stroke-width="2" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
            <circle cx="12" cy="9" r="3.5" fill="white"/>
        </svg>
    `),
    iconSize: [32, 52],
    iconAnchor: [16, 52],
    popupAnchor: [1, -44],
});

// Default marker icon (same as primary for consistency)
const DefaultIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="52">
            <path fill="#f59e0b" stroke="#f59e0b" stroke-width="2" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
            <circle cx="12" cy="9" r="3.5" fill="white"/>
        </svg>
    `),
    iconSize: [32, 52],
    iconAnchor: [16, 52],
    popupAnchor: [1, -44],
});

L.Marker.prototype.options.icon = PrimaryIcon;

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
    dayEvents = [],
    dayLodging = null,
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

    // Update map when dayEvents change (center on events)
    useEffect(() => {
        if ((dayEvents.length > 0 || dayLodging) && !selectedLocation) {
            // Calculate center of all events and lodging
            const lats: number[] = [];
            const lons: number[] = [];

            if (dayLodging) {
                lats.push(parseFloat(dayLodging.place_details.latitude));
                lons.push(parseFloat(dayLodging.place_details.longitude));
            }

            dayEvents.forEach(e => {
                lats.push(parseFloat(e.place_details.latitude));
                lons.push(parseFloat(e.place_details.longitude));
            });

            const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
            const centerLon = lons.reduce((sum, lon) => sum + lon, 0) / lons.length;

            setMapCenter([centerLat, centerLon]);
            setMapZoom(12);
        }
    }, [dayEvents, dayLodging, selectedLocation]);

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

    // Generate route coordinates from dayEvents (and lodging if exists)
    const routeCoordinates: [number, number][] = (() => {
        const coords: [number, number][] = [];

        // If lodging exists, add it as the starting point
        if (dayLodging) {
            coords.push([
                parseFloat(dayLodging.place_details.latitude),
                parseFloat(dayLodging.place_details.longitude),
            ]);
        }

        // Add all event coordinates
        dayEvents.forEach(event => {
            coords.push([
                parseFloat(event.place_details.latitude),
                parseFloat(event.place_details.longitude),
            ]);
        });

        return coords;
    })();

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

                {/* Lodging Marker (green) */}
                {dayLodging && (
                    <Marker
                        key={`lodging-${dayLodging.id}`}
                        position={[
                            parseFloat(dayLodging.place_details.latitude),
                            parseFloat(dayLodging.place_details.longitude),
                        ]}
                        icon={LodgingIcon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <div className="font-semibold">🏨 {dayLodging.place_details.name}</div>
                                <div className="text-gray-600 text-xs mt-1">{dayLodging.place_details.address}</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Day Events Markers (without animation) */}
                {dayEvents.map((event) => (
                    <Marker
                        key={event.id}
                        position={[
                            parseFloat(event.place_details.latitude),
                            parseFloat(event.place_details.longitude),
                        ]}
                        icon={PrimaryIcon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <div className="font-semibold">{event.place_details.name}</div>
                                <div className="text-gray-600 text-xs mt-1">{event.place_details.address}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Route Polyline - only show if there are 2+ events */}
                {routeCoordinates.length >= 2 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{
                            color: '#2bb0a6',
                            weight: 10,
                            opacity: 1,
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
