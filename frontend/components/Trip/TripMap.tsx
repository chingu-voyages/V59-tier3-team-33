'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type MarkerPlace = {
  latitude: number;
  longitude: number;
};

type TripMapProps = {
  markerPlace?: MarkerPlace | null;
  className?: string;
};

export default function TripMap({ markerPlace, className }: TripMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.9857, 40.7484],
      zoom: 10,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right',
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markerPlace) return;

    const lngLat: [number, number] = [markerPlace.longitude, markerPlace.latitude];

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker().setLngLat(lngLat).addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    map.flyTo({
      center: lngLat,
      zoom: Math.max(map.getZoom(), 13),
      speed: 0.8,
      curve: 1.2,
      essential: true,
    });
  }, [markerPlace?.latitude, markerPlace?.longitude]);

  if (!token) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-surface-500 bg-surface-100 text-sm text-danger-400">
        Missing NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  return <div ref={mapContainerRef} className={className ?? 'h-full w-full'} />;
}
