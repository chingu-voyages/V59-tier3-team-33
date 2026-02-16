'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaArrowLeft } from 'react-icons/fa';
import { SidebarShell } from '@/components/SidebarShell';
import { TripSidebar } from '@/components/TripSidebar';
import { PlaceDetails } from '@/components/PlaceDetails';
import { MapSearch } from '@/components/Map/MapSearch';
import { useTripStore } from '@/store/tripStore';
import { api } from '@/lib/api';
import type { NominatimResult } from '@/services/nominatim';

// Dynamically import Map component (client-side only)
const Map = dynamic(() => import('@/components/Map').then((mod) => mod.Map), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-surface-600 flex items-center justify-center">
            <div className="text-neutral-300">Loading map...</div>
        </div>
    ),
});

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;

    const {
        setTrip,
        setFavorites,
        setLodgings,
        clearTrip,
        selectedPlace,
        selectPlaceFromSearch,
        clearSelectedPlace,
        addFavorite,
        removeFavorite,
        activeTab,
        tripDaysById,
        eventsById,
        eventsByDayId,
        lodgingsById,
        lodgingsByDayId,
    } = useTripStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<NominatimResult | null>(null);

    const handleLocationSelect = (result: NominatimResult) => {
        setSelectedLocation(result);
        selectPlaceFromSearch(result);
    };

    const handleClosePlaceDetails = () => {
        clearSelectedPlace();
        setSelectedLocation(null);
    };

    const handleToggleFavorite = async (favoriteId?: string) => {
        if (favoriteId) {
            await removeFavorite(tripId, favoriteId);
        } else {
            const placeToFavorite = selectedLocation || selectedPlace?.place;

            if (!placeToFavorite) {
                return;
            }

            await addFavorite(tripId, placeToFavorite);
        }
    };

    const mapLocation = selectedPlace ? {
        place_id: parseInt(selectedPlace.place.external_id.replace('nominatim_', '')) || 0,
        licence: '',
        osm_type: 'node',
        osm_id: 0,
        lat: selectedPlace.place.latitude,
        lon: selectedPlace.place.longitude,
        display_name: selectedPlace.place.address,
        address: {},
        boundingbox: ['0', '0', '0', '0'] as [string, string, string, string],
        type: 'place',
        importance: 0.5,
    } as NominatimResult : selectedLocation;

    const dayEvents = (() => {
        if (selectedPlace || !activeTab.startsWith('day-')) {
            return [];
        }

        const match = activeTab.match(/day-(\d+)/);
        if (!match) return [];

        const dayNumber = parseInt(match[1], 10);

        const tripDay = Object.values(tripDaysById).find((day, index) => index + 1 === dayNumber);
        if (!tripDay) return [];

        const eventIds = eventsByDayId[tripDay.id] || [];

        return eventIds
            .map(id => eventsById[id])
            .filter(Boolean)
            .sort((a, b) => a.position - b.position);
    })();

    const dayLodging = (() => {
        if (selectedPlace || !activeTab.startsWith('day-')) {
            return null;
        }

        const match = activeTab.match(/day-(\d+)/);
        if (!match) return null;

        const dayNumber = parseInt(match[1], 10);

        const tripDay = Object.values(tripDaysById).find((day, index) => index + 1 === dayNumber);
        if (!tripDay) return null;

        const lodgingIds = lodgingsByDayId[tripDay.id] || [];
        if (lodgingIds.length === 0) return null;

        return lodgingsById[lodgingIds[0]] || null;
    })();

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const tripData = await api.get(`/trips/${tripId}/`);

                if (!tripData || !tripData.id) {
                    throw new Error('Invalid trip data received');
                }

                setTrip(tripData);

                try {
                    const savedPlacesData = await api.get(`/trips/${tripId}/saved-places/`);
                    setFavorites(savedPlacesData);
                } catch (favError) {
                    setFavorites([]);
                }

                try {
                    const lodgingsData = await api.get(`/trips/${tripId}/lodgings/`);
                    setLodgings(lodgingsData);
                } catch (lodgingError) {
                    setLodgings([]);
                }

                setIsLoading(false);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load trip';
                setError(errorMessage);
                setIsLoading(false);

                setTimeout(() => {
                    router.push('/trips');
                }, 2000);
            }
        };

        if (tripId) {
            fetchTripData();
        }

        return () => {
            clearTrip();
        };
    }, [tripId, setTrip, setFavorites, setLodgings, clearTrip, router]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface-400">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-neutral-300 font-medium">Loading trip...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface-400">
                <div className="text-center max-w-md p-8 bg-surface-50 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-400 mb-2">
                        Trip Not Found
                    </h2>
                    <p className="text-neutral-300 mb-4">{error}</p>
                    <p className="text-neutral-200 text-sm">
                        Redirecting to My Trips...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-screen overflow-hidden">
            {/* Base Layer: Map */}
            <Map
                className="absolute inset-0"
                selectedLocation={mapLocation}
                onLocationSelect={handleLocationSelect}
                dayEvents={dayEvents}
                dayLodging={dayLodging}
            />

            {/* Floating Navigation Layer - positioned below navbar */}
            <div className="absolute top-20 left-0 md:left-1/4 right-0 px-4 z-30">
                <div className="flex items-center gap-3">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/trips')}
                        className="shrink-0 w-12 h-12 bg-surface-50 rounded-full shadow-lg border border-surface-500 flex items-center justify-center hover:bg-surface-100 transition-colors"
                        aria-label="Go back"
                    >
                        <FaArrowLeft className="text-neutral-400 text-lg" />
                    </button>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md">
                        <MapSearch onLocationSelect={handleLocationSelect} />
                    </div>
                </div>
            </div>

            {/* Sidebar Shell (Desktop: Fixed Panel, Mobile: Bottom Drawer) */}
            <SidebarShell>
                {selectedPlace ? (
                    <PlaceDetails
                        context={selectedPlace}
                        tripId={tripId}
                        onClose={handleClosePlaceDetails}
                        onToggleFavorite={handleToggleFavorite}
                    />
                ) : (
                    <TripSidebar />
                )}
            </SidebarShell>
        </div>
    );
}
