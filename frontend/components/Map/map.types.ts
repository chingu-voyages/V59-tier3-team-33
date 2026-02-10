import mapboxgl from 'mapbox-gl';

export interface MapProps {
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  className?: string;
}

export type MapInstance = mapboxgl.Map;

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
