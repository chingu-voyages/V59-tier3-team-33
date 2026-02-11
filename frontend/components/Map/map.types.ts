import type { LatLngExpression } from 'leaflet';

export interface MapProps {
  initialCenter?: LatLngExpression; // [lat, lng]
  initialZoom?: number;
  className?: string;
  showSearch?: boolean; // Control whether to show the search bar
  onLocationSelect?: (result: NominatimResult) => void; // Callback for location selection
  selectedLocation?: NominatimResult | null; // Controlled selected location
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string];
  type: string;
  importance: number;
}
