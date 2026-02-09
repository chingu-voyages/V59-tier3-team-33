'use client';

import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapViewport, TripPlace } from './types';

type TripMapProps = {
  viewport: MapViewport;
  onViewportChange: (next: MapViewport) => void;
  savedPlaces: TripPlace[];
  selectedPlace: TripPlace | null;
  activePlaceId?: string | null;
  onSelectPlace: (place: TripPlace) => void;
  className?: string;
};

export default function TripMap({
  viewport,
  onViewportChange,
  savedPlaces,
  selectedPlace,
  activePlaceId,
  onSelectPlace,
  className,
}: TripMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const placesToRender = useMemo(() => {
    const map = new Map<string, TripPlace>();
    if (selectedPlace) map.set(selectedPlace.mapbox_id, selectedPlace);
    for (const place of savedPlaces) {
      if (!map.has(place.mapbox_id)) map.set(place.mapbox_id, place);
    }
    return Array.from(map.values());
  }, [savedPlaces, selectedPlace]);

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [viewport.lng, viewport.lat],
      zoom: viewport.zoom,
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      onViewportChange({
        lng: center.lng,
        lat: center.lat,
        zoom: map.getZoom(),
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [token, onViewportChange, viewport.lat, viewport.lng, viewport.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    const needsMove =
      Math.abs(currentCenter.lng - viewport.lng) > 0.0001 ||
      Math.abs(currentCenter.lat - viewport.lat) > 0.0001 ||
      Math.abs(currentZoom - viewport.zoom) > 0.01;

    if (needsMove) {
      map.easeTo({
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom,
        duration: 250,
      });
    }
  }, [viewport]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    for (const place of placesToRender) {
      const isActive =
        (activePlaceId && place.mapbox_id === activePlaceId) ||
        (!!selectedPlace && place.mapbox_id === selectedPlace.mapbox_id);

      const markerColor = isActive ? '#F59E0B' : '#64748B';

      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(place.name))
        .addTo(map);

      marker.getElement().addEventListener('click', () => onSelectPlace(place));
      markersRef.current.push(marker);
    }
  }, [placesToRender, activePlaceId, selectedPlace, onSelectPlace]);

  if (!token) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-surface-500 bg-surface-100 text-sm text-danger-400">
        Missing NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  return <div ref={mapContainerRef} className={className ?? 'h-full w-full'} />;
}
