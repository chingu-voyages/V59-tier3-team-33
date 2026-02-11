'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaArrowLeft } from 'react-icons/fa';
import { SidebarShell } from '@/components/SidebarShell';
import { TripSidebar } from '@/components/TripSidebar';
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

    const { setTrip, setFavorites, clearTrip } = useTripStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<NominatimResult | null>(null);

    const handleLocationSelect = (result: NominatimResult) => {
        console.log('Location selected:', result);
        setSelectedLocation(result);
    };

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch full trip details with trip_days
                const tripData = await api.get(`/trips/${tripId}/`);

                if (!tripData || !tripData.id) {
                    throw new Error('Invalid trip data received');
                }

                setTrip(tripData);

                // Fetch saved places (favorites)
                try {
                    const savedPlacesData = await api.get(`/trips/${tripId}/saved-places/`);
                    setFavorites(savedPlacesData);
                } catch (favError) {
                    console.error('Failed to fetch saved places:', favError);
                    // Don't fail the whole page if favorites fail
                    setFavorites([]);
                }

                setIsLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch trip data:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load trip';
                setError(errorMessage);
                setIsLoading(false);

                // Redirect to trips page after a short delay
                setTimeout(() => {
                    router.push('/trips');
                }, 2000);
            }
        };

        if (tripId) {
            fetchTripData();
        }

        // Cleanup on unmount
        return () => {
            clearTrip();
        };
    }, [tripId, setTrip, setFavorites, clearTrip, router]);

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
        <div className="relative h-screen w-full overflow-hidden">
            {/* Base Layer: Map */}
            <Map
                className="absolute inset-0"
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
            />

            {/* Floating Navigation Layer */}
            <div className="absolute top-0 left-0 md:left-1/4 right-0 p-4" style={{ zIndex: 1000 }}>
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
                <TripSidebar />
            </SidebarShell>
        </div>
    );
}
