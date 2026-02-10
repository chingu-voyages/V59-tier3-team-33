export interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  total_days: number;
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
  date?: string;
}
