'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { SidebarShell } from '@/components/SidebarShell';
import TripMap from '@/components/Trip/TripMap';
import TripSavedPlaceSearch from '@/components/Trip/TripSavedPlaceSearch';
import type { MapViewport, TripPlace } from '@/components/Trip/types';

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const normalizeBearing = (value: number) => ((value % 360) + 360) % 360;

function bearingBetweenPoints(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
) {
  const phi1 = toRad(fromLat);
  const phi2 = toRad(toLat);
  const deltaLambda = toRad(toLng - fromLng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  return normalizeBearing(toDeg(Math.atan2(y, x)));
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [viewport, setViewport] = useState<MapViewport>({
    lng: -73.9857,
    lat: 40.7484,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  });

  const [query, setQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<TripPlace | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<TripPlace[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const focusPlace = (place: TripPlace) => {
    setSelectedPlace(place);
    setActivePlaceId(place.mapbox_id);
    setViewport((prev) => ({
      ...prev,
      lng: place.longitude,
      lat: place.latitude,
      zoom: Math.max(prev.zoom, 14),
      pitch: 45,
      bearing: bearingBetweenPoints(prev.lng, prev.lat, place.longitude, place.latitude),
    }));
  };

  const handleSaveSelected = async () => {
    if (!selectedPlace) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      // TODO: wire backend endpoint
      // await api.post(`/trips/${tripId}/saved-places/`, { place: selectedPlace });

      setSavedPlaces((prev) => {
        const exists = prev.some((p) => p.mapbox_id === selectedPlace.mapbox_id);
        return exists ? prev : [selectedPlace, ...prev];
      });

      setSaveSuccess('Place saved to this trip.');
    } catch {
      setSaveError('Could not save place. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-surface-400 md:flex">
      <div className="relative h-full w-full md:flex-1">
        <TripMap
        markerPlace={
            selectedPlace
            ? { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude }
            : null
        }
        className="h-full w-full"
        />


        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-black/20 to-transparent" />

        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-surface-500 bg-surface-50 shadow-lg transition-colors hover:bg-surface-100"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-lg text-neutral-400" />
            </button>

            <TripSavedPlaceSearch
              mode="search-bar"
              query={query}
              onQueryChange={setQuery}
              onSelectPlace={focusPlace}
              proximity={{ lng: viewport.lng, lat: viewport.lat }}
              placeholder="Search cafes, museums, landmarks..."
            />
          </div>
        </div>
      </div>

      <SidebarShell>
        <div className="p-6">
          <p className="mb-1 text-xs text-neutral-100">Trip</p>
          <p className="mb-6 text-sm font-medium text-neutral-300">
            ID: {tripId ?? 'Unknown'}
          </p>

          <TripSavedPlaceSearch
            mode="panel"
            selectedPlace={selectedPlace}
            savedPlaces={savedPlaces}
            onSaveSelected={handleSaveSelected}
            onPickSavedPlace={focusPlace}
            isSaving={isSaving}
            error={saveError}
            success={saveSuccess}
          />
        </div>
      </SidebarShell>
    </div>
  );
}
