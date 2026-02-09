'use client';

import { SearchBox } from '@mapbox/search-js-react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import type { TripPlace } from './types';

type SearchBarModeProps = {
  mode: 'search-bar';
  query: string;
  onQueryChange: (value: string) => void;
  onSelectPlace: (place: TripPlace) => void;
  placeholder?: string;
  proximity?: { lng: number; lat: number };
};

type SidebarModeProps = {
  mode: 'sidebar';
  selectedPlace: TripPlace | null;
  savedPlaces: TripPlace[];
  onSaveSelected: () => Promise<void> | void;
  isSaving: boolean;
  error?: string | null;
  success?: string | null;
};

type TripSavedPlaceSearchProps = SearchBarModeProps | SidebarModeProps;

function mapRetrieveToTripPlace(retrieveResult: any): TripPlace | null {
  const feature = retrieveResult?.features?.[0];
  const coords = feature?.geometry?.coordinates;

  if (!Array.isArray(coords) || coords.length < 2) return null;

  const [lng, lat] = coords;
  const props = feature?.properties ?? {};
  const metadata = props?.metadata ?? {};

  return {
    mapbox_id: props?.mapbox_id ?? feature?.id ?? 'unknown',
    name: props?.name ?? props?.full_address ?? 'Unknown place',
    full_address: props?.full_address ?? null,
    latitude: Number(lat),
    longitude: Number(lng),
    image_url: metadata?.primary_photo ?? null,
  };
}

export default function TripSavedPlaceSearch(props: TripSavedPlaceSearchProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (props.mode === 'search-bar') {
    if (!token) {
      return (
        <div className="flex-1 rounded-full border border-surface-500 bg-surface-50 px-4 py-3 text-sm text-danger-400 shadow-lg">
          Missing NEXT_PUBLIC_MAPBOX_TOKEN
        </div>
      );
    }

    return (
      <div className="flex-1 rounded-full border border-surface-500 bg-surface-50 px-2 py-1 shadow-lg">
        <SearchBox
          accessToken={token}
          value={props.query}
          onChange={(next) => props.onQueryChange(next)}
          placeholder={props.placeholder ?? 'Search places...'}
          options={{
            types: 'poi,category',
            limit: 8,
            language: 'en',
            ...(props.proximity
              ? { proximity: [props.proximity.lng, props.proximity.lat] }
              : {}),
          }}
          onRetrieve={(retrieveResult) => {
            const place = mapRetrieveToTripPlace(retrieveResult);
            if (!place) return;
            props.onSelectPlace(place);
            props.onQueryChange(place.name);
          }}
        />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-400">Selected Place</h2>

        {!props.selectedPlace && (
          <p className="mt-2 text-sm text-neutral-100">
            Search from the top bar and select a POI.
          </p>
        )}

        {props.selectedPlace && (
          <div className="mt-3 rounded-xl border border-surface-500 bg-surface-50 p-4">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-primary-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-400">
                  {props.selectedPlace.name}
                </p>

                {props.selectedPlace.full_address && (
                  <p className="mt-1 text-xs text-neutral-200">
                    {props.selectedPlace.full_address}
                  </p>
                )}

                <p className="mt-2 text-xs text-neutral-100">
                  {props.selectedPlace.latitude.toFixed(5)},{' '}
                  {props.selectedPlace.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            {props.selectedPlace.image_url ? (
              <img
                src={props.selectedPlace.image_url}
                alt={props.selectedPlace.name}
                className="mt-3 h-36 w-full rounded-lg object-cover"
              />
            ) : null}

            <button
              type="button"
              onClick={props.onSaveSelected}
              disabled={props.isSaving}
              className="mt-4 w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
            >
              {props.isSaving ? 'Saving...' : 'Save to Trip'}
            </button>
          </div>
        )}

        {props.error ? <p className="mt-3 text-sm text-danger-400">{props.error}</p> : null}
        {props.success ? <p className="mt-3 text-sm text-primary">{props.success}</p> : null}
      </div>

      <div>
        <h3 className="text-base font-semibold text-neutral-400">Saved Places</h3>

        {props.savedPlaces.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-100">No saved places yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {props.savedPlaces.map((place) => (
              <div
                key={place.mapbox_id}
                className="rounded-lg border border-surface-500 bg-surface-50 p-3"
              >
                <p className="text-sm font-medium text-neutral-400">{place.name}</p>
                {place.full_address ? (
                  <p className="mt-1 text-xs text-neutral-200">{place.full_address}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
