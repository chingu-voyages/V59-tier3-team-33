'use client';

import TripMap from '@/components/Trip/TripMap';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const SearchBox = dynamic(
  () => import('@mapbox/search-js-react').then((m) => m.SearchBox),
  { ssr: false }
);

type SelectedPlace = {
  mapbox_id: string;
  name: string;
  full_address?: string | null;
  latitude: number;
  longitude: number;
};

export default function TripSavedPlaceSearch() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const accessToken = useMemo(() => {
    if (!token) throw new Error('Missing NEXT_PUBLIC_MAPBOX_TOKEN');
    return token;
  }, [token]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SelectedPlace | null>(null);

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          Search for a place
        </label>

        <SearchBox
          accessToken={accessToken}
          value={query}
          onChange={(v) => setQuery(v)}
          onRetrieve={(res) => {
            const feature = res?.features?.[0];
            if (!feature) return;

            const coords = feature.geometry?.coordinates;
            if (!coords || coords.length < 2) return;

            const [lng, lat] = coords;

            setSelected({
              mapbox_id: feature.properties?.mapbox_id ?? feature.id ?? 'unknown',
              name:
                feature.properties?.name ??
                feature.properties?.full_address ??
                'Unknown place',
              full_address: feature.properties?.full_address ?? null,
              latitude: Number(lat),
              longitude: Number(lng),
            });
          }}
        />
        <TripMap
          markerPlace={
            selected
            ? { latitude: selected.latitude, longitude: selected.longitude }: null
          }
          />
      </div>

      {selected && (
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700 }}>{selected.name}</div>

          {selected.full_address && (
            <div style={{ opacity: 0.8, marginTop: 4 }}>{selected.full_address}</div>
          )}

          <div style={{ opacity: 0.8, marginTop: 6, fontSize: 12 }}>
            {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
          </div>
        </div>
      )}
    </section>
  );
}
