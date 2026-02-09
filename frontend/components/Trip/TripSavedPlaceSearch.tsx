'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaRegStar, FaSearch } from 'react-icons/fa';
import type { TripPlace } from './types';

type SearchBarModeProps = {
  mode: 'search-bar';
  query: string;
  onQueryChange: (value: string) => void;
  onSelectPlace: (place: TripPlace) => void;
  placeholder?: string;
  proximity?: { lng: number; lat: number };
};

type PanelModeProps = {
  mode: 'panel';
  selectedPlace: TripPlace | null;
  savedPlaces: TripPlace[];
  onSaveSelected: () => Promise<void> | void;
  onPickSavedPlace: (place: TripPlace) => void;
  isSaving: boolean;
  error?: string | null;
  success?: string | null;
};

type TripSavedPlaceSearchProps = SearchBarModeProps | PanelModeProps;

type Suggestion = {
  mapbox_id: string;
  name: string;
  full_address?: string | null;
  category?: string | null;
};

function createSessionToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function mapRetrieveToPlace(payload: any): TripPlace | null {
  const feature = payload?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const [lng, lat] = coords;
  const props = feature?.properties ?? {};
  const metadata = props?.metadata ?? {};
  const category = Array.isArray(props?.poi_category)
    ? props.poi_category[0]
    : props?.poi_category || null;

  return {
    mapbox_id: props?.mapbox_id ?? feature?.id ?? 'unknown',
    name: props?.name ?? props?.full_address ?? 'Unknown place',
    full_address: props?.full_address ?? props?.place_formatted ?? null,
    latitude: Number(lat),
    longitude: Number(lng),
    image_url: metadata?.primary_photo ?? null,
    category,
  };
}

export default function TripSavedPlaceSearch(props: TripSavedPlaceSearchProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const sessionTokenRef = useRef(createSessionToken());

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const proximityParam = useMemo(() => {
    if (props.mode !== 'search-bar' || !props.proximity) return null;
    return `${props.proximity.lng},${props.proximity.lat}`;
  }, [props]);

  useEffect(() => {
    if (props.mode !== 'search-bar') return;
    if (!token) return;

    const text = props.query.trim();
    if (text.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          q: text,
          language: 'en',
          limit: '8',
          types: 'poi,category',
          access_token: token,
          session_token: sessionTokenRef.current,
        });

        if (proximityParam) params.set('proximity', proximityParam);

        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error(`Suggest failed (${res.status})`);
        const json = await res.json();

        const mapped: Suggestion[] = (json?.suggestions ?? [])
          .filter((item: any) => item?.mapbox_id)
          .map((item: any) => ({
            mapbox_id: item.mapbox_id,
            name: item.name ?? item.place_formatted ?? 'Unknown place',
            full_address: item.full_address ?? item.place_formatted ?? null,
            category: Array.isArray(item.poi_category_ids)
              ? item.poi_category_ids[0]
              : null,
          }));

        setSuggestions(mapped);
        setOpen(mapped.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [props, token, proximityParam]);

  const selectSuggestion = async (suggestion: Suggestion) => {
    if (props.mode !== 'search-bar' || !token) return;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        access_token: token,
        session_token: sessionTokenRef.current,
      });

      const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
        suggestion.mapbox_id,
      )}?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Retrieve failed (${res.status})`);

      const json = await res.json();
      const place = mapRetrieveToPlace(json);
      if (!place) return;

      props.onSelectPlace(place);
      props.onQueryChange(place.name);
      setSuggestions([]);
      setOpen(false);
      sessionTokenRef.current = createSessionToken();
    } finally {
      setLoading(false);
    }
  };

  if (props.mode === 'search-bar') {
    if (!token) {
      return (
        <div className="w-full rounded-full border border-surface-500 bg-surface-50 px-4 py-3 text-sm text-danger-400 shadow-lg">
          Missing NEXT_PUBLIC_MAPBOX_TOKEN
        </div>
      );
    }

    return (
      <div className="relative w-full">
        <FaSearch className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-neutral-100" />

        <input
          type="text"
          value={props.query}
          onChange={(e) => props.onQueryChange(e.target.value)}
          placeholder={props.placeholder ?? 'Search POIs...'}
          onFocus={() => setOpen(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          className="h-12 w-full rounded-full border border-surface-500 bg-surface-50/95 pr-4 pl-11 text-sm shadow-lg outline-none backdrop-blur placeholder:text-neutral-100 focus:border-primary-400 focus:ring-2 focus:ring-primary-300/50"
        />

        {loading && (
          <div className="absolute top-14 left-0 right-0 rounded-xl border border-surface-500 bg-surface-50 p-3 text-xs text-neutral-200 shadow-lg">
            Searching POIs...
          </div>
        )}

        {!loading && open && suggestions.length > 0 && (
          <div className="absolute top-14 left-0 right-0 max-h-80 overflow-auto rounded-2xl border border-surface-500 bg-surface-50 p-2 shadow-xl">
            {suggestions.map((item) => (
              <button
                key={item.mapbox_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void selectSuggestion(item)}
                className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-100"
              >
                <p className="truncate text-sm font-medium text-neutral-400">
                  {item.name}
                </p>
                {item.full_address ? (
                  <p className="mt-1 truncate text-xs text-neutral-200">
                    {item.full_address}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-surface-500 bg-surface-50 p-4 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-400">Selected Place</h2>

        {!props.selectedPlace ? (
          <p className="mt-2 text-sm text-neutral-100">
            Search from the top bar and select a POI.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-1 text-primary-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-400">
                  {props.selectedPlace.name}
                </p>

                {props.selectedPlace.category ? (
                  <p className="mt-1 inline-flex rounded-full bg-secondary-300 px-2 py-0.5 text-xs text-surface-100">
                    {props.selectedPlace.category}
                  </p>
                ) : null}

                {props.selectedPlace.full_address ? (
                  <p className="mt-2 text-xs text-neutral-200">
                    {props.selectedPlace.full_address}
                  </p>
                ) : null}
              </div>
            </div>

            {props.selectedPlace.image_url ? (
              <img
                src={props.selectedPlace.image_url}
                alt={props.selectedPlace.name}
                className="h-36 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-surface-500 bg-surface-100 text-xs text-neutral-100">
                No image available for this POI
              </div>
            )}

            <button
              type="button"
              onClick={props.onSaveSelected}
              disabled={props.isSaving}
              className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
            >
              {props.isSaving ? 'Saving...' : 'Save to Trip'}
            </button>
          </div>
        )}

        {props.error ? <p className="mt-3 text-sm text-danger-400">{props.error}</p> : null}
        {props.success ? <p className="mt-3 text-sm text-primary">{props.success}</p> : null}
      </div>

      <div className="rounded-2xl border border-surface-500 bg-surface-50 p-4 shadow-sm">
        <h3 className="text-base font-semibold text-neutral-400">Saved Places</h3>

        {props.savedPlaces.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-100">No saved places yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {props.savedPlaces.map((place) => (
              <button
                key={place.mapbox_id}
                type="button"
                onClick={() => props.onPickSavedPlace(place)}
                className="flex w-full items-start gap-3 rounded-xl border border-surface-500 bg-white p-3 text-left transition-colors hover:bg-surface-100"
              >
                <FaRegStar className="mt-1 text-secondary-300" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-400">
                    {place.name}
                  </p>
                  {place.full_address ? (
                    <p className="mt-1 truncate text-xs text-neutral-200">
                      {place.full_address}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
