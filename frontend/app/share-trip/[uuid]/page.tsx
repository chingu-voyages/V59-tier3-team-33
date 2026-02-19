'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaArrowLeft } from 'react-icons/fa';
import { SidebarShell } from '@/components/SidebarShell';
import { PublicTripSidebar } from '@/components/PublicTripSidebar';
import { PublicPlaceDetails } from '@/components/PublicPlaceDetails';
import { api } from '@/lib/api';
import type { Trip, Event, Lodging, TabId, Place } from '@/types/trip';
import { format } from 'date-fns';

const Map = dynamic(() => import('@/components/Map').then((mod) => mod.Map), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-surface-600 flex items-center justify-center">
            <div className="text-neutral-300">Loading map...</div>
        </div>
    ),
});

export default function PublicTripPage() {
    const params = useParams();
    const router = useRouter();
    const uuid = params.uuid as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [dayEvents, setDayEvents] = useState<Event[]>([]);
    const [dayLodging, setDayLodging] = useState<Lodging | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    useEffect(() => {
        const fetchPublicTrip = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_BASE?.replace(/\/$/, '') || '';
                const response = await fetch(`${API_BASE}/trips/shared/${uuid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Trip not found or is private');
                }

                const result = await response.json();
                const tripData = result.data || result;

                if (!tripData || !tripData.id) {
                    throw new Error('Invalid trip data received');
                }

                setTrip(tripData);
                setIsLoading(false);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load trip';
                setError(errorMessage);
                setIsLoading(false);
            }
        };

        if (uuid) {
            fetchPublicTrip();
        }
    }, [uuid]);

    // Update map data when active tab changes
    useEffect(() => {
        if (!trip || !trip.trip_days) {
            setDayEvents([]);
            setDayLodging(null);
            return;
        }

        if (activeTab.startsWith('day-')) {
            const match = activeTab.match(/day-(\d+)/);
            if (!match) return;

            const dayNumber = parseInt(match[1], 10);
            const tripDay = trip.trip_days[dayNumber - 1];

            if (tripDay) {
                const events = tripDay.events || [];
                setDayEvents(events.sort((a, b) => a.position - b.position));
                setDayLodging(null);
            }
        } else {
            setDayEvents([]);
            setDayLodging(null);
        }
    }, [activeTab, trip]);

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

    if (error || !trip) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface-400">
                <div className="text-center max-w-md p-8 bg-surface-50 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-400 mb-2">
                        Trip Not Available
                    </h2>
                    <p className="text-neutral-300 mb-4">
                        {error || 'This trip is private or does not exist.'}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    const startDate = format(new Date(trip.start_date), 'MMM d, yyyy');
    const endDate = format(new Date(trip.end_date), 'MMM d, yyyy');

    // Create map location for selected place
    const mapLocation = selectedPlace ? {
        place_id: 0,
        licence: '',
        osm_type: 'node' as const,
        osm_id: 0,
        lat: selectedPlace.latitude,
        lon: selectedPlace.longitude,
        display_name: selectedPlace.address,
        address: {},
        boundingbox: ['0', '0', '0', '0'] as [string, string, string, string],
        type: 'place',
        importance: 0.5,
    } : null;

    return (
        <div className="fixed inset-0 w-full h-screen overflow-hidden">
            {/* Base Layer: Map */}
            <Map
                className="absolute inset-0"
                selectedLocation={mapLocation}
                dayEvents={selectedPlace ? [] : dayEvents}
                dayLodging={selectedPlace ? null : dayLodging}
            />

            {/* Floating Back Button */}
            <div className="absolute top-24 left-4 md:left-1/4 z-30">
                <button
                    onClick={() => router.push('/')}
                    className="w-12 h-12 bg-surface-50 rounded-full shadow-lg border border-surface-500 flex items-center justify-center hover:bg-surface-100 transition-colors"
                    aria-label="Go back"
                >
                    <FaArrowLeft className="text-neutral-400 text-lg" />
                </button>
            </div>

            {/* Sidebar Shell */}
            <SidebarShell>
                {selectedPlace ? (
                    <PublicPlaceDetails
                        place={selectedPlace}
                        onClose={() => setSelectedPlace(null)}
                    />
                ) : (
                    <PublicTripSidebar
                        trip={trip}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onPlaceClick={setSelectedPlace}
                    />
                )}
            </SidebarShell>
        </div>
    );
}
