'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { MapProps } from './map.types';
import L from 'leaflet';
import { MapSearch } from './MapSearch';
import type { NominatimResult } from '@/services/nominatim';

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

const LodgingIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64=' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="52">
            <path fill="#10b981" stroke="#059669" stroke-width="2" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
            <circle cx="12" cy="9" r="3.5" fill="white"/>
        </svg>
    `),
    iconSize: [32, 52],
    iconAnchor: [16, 52],
    popupAnchor: [1, -44],
});

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

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    const prevCenter = useRef<[number, number]>(center);

    useEffect(() => {
        if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
            map.flyTo(center, zoom, {
                duration: 2,
                easeLinearity: 0.25,
            });
            prevCenter.current = center;
        }
    }, [center, zoom, map]);

    return null;
}

// Animated marker component
function AnimatedMarker({ position, displayName }: { position: [number, number]; displayName: string }) {
    const markerRef = useRef<L.Marker>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isReady || !markerRef.current) return;

        const marker = markerRef.current;

        const icon = marker.getElement();
        if (icon) {
            icon.style.animation = 'markerDrop 0.6s ease-out';
        }

        const popupTimer = setTimeout(() => {
            try {
                marker.openPopup();
            } catch (error) {

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
    initialCenter = [39.8283, -98.5795],
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

    const selectedLocation = externalSelectedLocation !== undefined ? externalSelectedLocation : internalSelectedLocation;

    useEffect(() => {
        if (selectedLocation) {
            const lat = parseFloat(selectedLocation.lat);
            const lon = parseFloat(selectedLocation.lon);
            setMapCenter([lat, lon]);
            setMapZoom(13);
        }
    }, [selectedLocation]);

    useEffect(() => {
        if ((dayEvents.length > 0 || dayLodging) && !selectedLocation) {
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
        if (externalSelectedLocation === undefined) {
            setInternalSelectedLocation(result);
        }

        if (onLocationSelect) {
            onLocationSelect(result);
        }
    };

    const maxBounds: L.LatLngBoundsExpression = [
        [-90, -180],
        [90, 180]
    ];

    const routeCoordinates: [number, number][] = (() => {
        const coords: [number, number][] = [];

        if (dayLodging) {
            coords.push([
                parseFloat(dayLodging.place_details.latitude),
                parseFloat(dayLodging.place_details.longitude),
            ]);
        }

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
            {showSearch && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[1000]">
                    <MapSearch onLocationSelect={handleLocationSelect} />
                </div>
            )}

            <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                minZoom={4}
                maxZoom={19}
                maxBounds={maxBounds}
                maxBoundsViscosity={1.0}
                zoomControl={false}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ background: '#e5e7eb', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    minZoom={2}
                    maxZoom={19}
                    noWrap={true}
                    bounds={maxBounds}
                />

                <ZoomControl position="bottomleft" />

                <MapViewController center={mapCenter} zoom={mapZoom} />

                {selectedLocation && (
                    <AnimatedMarker
                        key={`${selectedLocation.lat}-${selectedLocation.lon}`}
                        position={[parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]}
                        displayName={selectedLocation.display_name}
                    />
                )}

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

                {routeCoordinates.length >= 2 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{
                            color: '#6366f1',
                            weight: 4,
                            opacity: 0.8,
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
