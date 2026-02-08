'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type MarkerPlace = {
  latitude: number;
  longitude: number;
};

export default function TripMap({
  markerPlace,
}: {
  markerPlace?: MarkerPlace | null;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.9857, 40.7484], // default center (NYC)
      zoom: 10,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // update / place marker when markerPlace changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markerPlace) return;

    const lngLat: [number, number] = [markerPlace.longitude, markerPlace.latitude];

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker().setLngLat(lngLat).addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), 13) });
  }, [markerPlace?.latitude, markerPlace?.longitude]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: 420, width: '100%', borderRadius: 12, overflow: 'hidden' }}
    />
  );
}