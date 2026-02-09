export type TripPlace = {
  mapbox_id: string;
  name: string;
  full_address?: string | null;
  latitude: number;
  longitude: number;
  image_url?: string | null;
};

export type MapViewport = {
  lng: number;
  lat: number;
  zoom: number;
};
