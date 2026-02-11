export interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  total_days: number;
  trip_days?: TripDay[];
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
  type: 'ACTIVITY' | 'TRANSPORT' | 'MEAL' | 'OTHER';
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
