export interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  total_days: number;
  trip_days?: TripDay[];
  is_public?: boolean;
  public_url?: string;
}

export interface Place {
  id: string;
  external_id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: string;
  longitude: string;
}

export interface Event {
  id: string;
  trip_day: string;
  place_details: Place;
  start_time: string;
  duration: number;
  notes: string | null;
  position: number;
  type: 'FLIGHT' | 'TRAIN' | 'BUS' | 'MEAL' | 'ACTIVITY' | 'OTHER';
}

export interface Lodging {
  id: string;
  trip: string;
  arrival_date: string; // YYYY-MM-DD
  departure_date: string; // YYYY-MM-DD
  place_details: Place;
}

export interface TripDay {
  id: string;
  trip: string;
  date: string;
  events: Event[];
}

export interface SavedPlace {
  id: string;
  trip: string;
  place_details: Place;
  saved_by: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

export type TabId = 'favorites' | 'overview' | `day-${number}`;

export interface Tab {
  id: TabId;
  label: string;
  icon?: React.ReactNode;
  date?: string; // API format (YYYY-MM-DD)
  displayDate?: string; // Display format (e.g., "Feb 1")
}

// Place context for tracking where a place was selected from
export type PlaceSource = 'search' | 'favorite' | 'event' | 'lodging';

export interface PlaceContext {
  place: Place;  // Normalized place data
  source: PlaceSource;
  
  // Metadata
  favoriteId?: string;  // If it's a saved place
  eventId?: string;     // If it's an event
  lodgingId?: string;   // If it's a lodging
  tripDayId?: string;   // Which day it belongs to
  
  // Computed flags
  isFavorite: boolean;
  isInItinerary: boolean;
  isLodging: boolean;
}
