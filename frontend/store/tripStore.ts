import { create } from 'zustand';
import { Trip, SavedPlace, TabId, TripDay, Event, Lodging, PlaceContext, Place } from '@/types/trip';
import type { NominatimResult } from '@/services/nominatim';
import { api } from '@/lib/api';
import type { AccommodationFormData, EventFormData } from '@/components/AddPlaceDialog';

interface TripState {
  // Raw data
  trip: Trip | null;
  
  // Normalized data (dictionaries for O(1) lookup)
  favoritesById: Record<string, SavedPlace>;
  favoriteIds: string[];
  tripDaysById: Record<string, TripDay>;
  tripDayIds: string[];
  eventsById: Record<string, Event>;
  eventsByDayId: Record<string, string[]>;
  lodgingsById: Record<string, Lodging>;
  lodgingIds: string[];
  lodgingsByDayId: Record<string, string[]>; // Lodgings active on each day
  
  // Reverse lookups
  placeIdToFavoriteId: Record<string, string>;
  placeIdToEventIds: Record<string, string[]>;
  placeIdToLodgingId: Record<string, string>;
  
  // UI state
  activeTab: TabId;
  selectedPlace: PlaceContext | null;
  
  // Actions
  setTrip: (trip: Trip) => void;
  setFavorites: (favorites: SavedPlace[]) => void;
  setLodgings: (lodgings: Lodging[]) => void;
  setActiveTab: (tab: TabId) => void;
  
  // Place selection
  selectPlaceFromSearch: (place: NominatimResult) => void;
  selectPlaceFromFavorite: (favoriteId: string) => void;
  selectPlaceFromEvent: (eventId: string) => void;
  selectPlaceFromLodging: (lodgingId: string) => void;
  clearSelectedPlace: () => void;
  
  // CRUD operations
  addFavorite: (tripId: string, placeOrNominatim: NominatimResult | Place) => Promise<void>;
  removeFavorite: (tripId: string, favoriteId: string) => Promise<void>;
  addLodging: (tripId: string, data: AccommodationFormData, place: Place) => Promise<void>;
  addEvent: (tripId: string, data: EventFormData, place: Place) => Promise<void>;
  deleteLodging: (tripId: string, lodgingId: string) => Promise<void>;
  toggleTripPublic: (tripId: string, isPublic: boolean) => Promise<void>;
  
  // Utility
  clearTrip: () => void;
}

// Helper to normalize Nominatim result to Place
function nominatimToPlace(nominatim: NominatimResult): Omit<Place, 'id'> {
  return {
    external_id: `nominatim_${nominatim.place_id}`,
    name: nominatim.display_name.split(',')[0],
    address: nominatim.display_name,
    latitude: nominatim.lat,
    longitude: nominatim.lon,
    description: null,
  };
}

// Helper to normalize trip data
function normalizeTripData(trip: Trip, favorites: SavedPlace[], lodgings: Lodging[]) {
  const favoritesById: Record<string, SavedPlace> = {};
  const favoriteIds: string[] = [];
  const placeIdToFavoriteId: Record<string, string> = {};
  
  favorites.forEach(fav => {
    favoritesById[fav.id] = fav;
    favoriteIds.push(fav.id);
    placeIdToFavoriteId[fav.place_details.id] = fav.id;
  });
  
  const tripDaysById: Record<string, TripDay> = {};
  const tripDayIds: string[] = [];
  const eventsById: Record<string, Event> = {};
  const eventsByDayId: Record<string, string[]> = {};
  const placeIdToEventIds: Record<string, string[]> = {};
  
  trip.trip_days?.forEach(day => {
    tripDaysById[day.id] = day;
    tripDayIds.push(day.id);
    eventsByDayId[day.id] = [];
    
    day.events.forEach(event => {
      eventsById[event.id] = event;
      eventsByDayId[day.id].push(event.id);
      
      const placeId = event.place_details.id;
      if (!placeIdToEventIds[placeId]) {
        placeIdToEventIds[placeId] = [];
      }
      placeIdToEventIds[placeId].push(event.id);
    });
  });
  
  // Normalize lodgings
  const lodgingsById: Record<string, Lodging> = {};
  const lodgingIds: string[] = [];
  const lodgingsByDayId: Record<string, string[]> = {};
  const placeIdToLodgingId: Record<string, string> = {};
  
  // Initialize lodgingsByDayId for all days
  tripDayIds.forEach(dayId => {
    lodgingsByDayId[dayId] = [];
  });
  
  lodgings.forEach(lodging => {
    lodgingsById[lodging.id] = lodging;
    lodgingIds.push(lodging.id);
    placeIdToLodgingId[lodging.place_details.id] = lodging.id;
    
    // Find which days this lodging is active on
    const arrivalDate = new Date(lodging.arrival_date);
    const departureDate = new Date(lodging.departure_date);
    
    tripDayIds.forEach(dayId => {
      const day = tripDaysById[dayId];
      const dayDate = new Date(day.date);
      
      // Check if this day falls within the lodging date range (inclusive)
      if (dayDate >= arrivalDate && dayDate <= departureDate) {
        lodgingsByDayId[dayId].push(lodging.id);
      }
    });
  });
  
  return {
    favoritesById,
    favoriteIds,
    tripDaysById,
    tripDayIds,
    eventsById,
    eventsByDayId,
    placeIdToFavoriteId,
    placeIdToEventIds,
    lodgingsById,
    lodgingIds,
    lodgingsByDayId,
    placeIdToLodgingId,
  };
}

export const useTripStore = create<TripState>((set, get) => ({
  // Initial state
  trip: null,
  favoritesById: {},
  favoriteIds: [],
  tripDaysById: {},
  tripDayIds: [],
  eventsById: {},
  eventsByDayId: {},
  lodgingsById: {},
  lodgingIds: [],
  lodgingsByDayId: {},
  placeIdToFavoriteId: {},
  placeIdToEventIds: {},
  placeIdToLodgingId: {},
  activeTab: 'favorites',
  selectedPlace: null,
  
  // Actions
  setTrip: (trip) => {
    const state = get();
    const normalized = normalizeTripData(trip, Object.values(state.favoritesById), Object.values(state.lodgingsById));
    set({ 
      trip,
      ...normalized,
    });
  },
  
  setFavorites: (favorites) => {
    const state = get();
    if (!state.trip) {
      set({ favoritesById: {}, favoriteIds: [] });
      return;
    }
    
    const normalized = normalizeTripData(state.trip, favorites, Object.values(state.lodgingsById));
    set({
      favoritesById: normalized.favoritesById,
      favoriteIds: normalized.favoriteIds,
      placeIdToFavoriteId: normalized.placeIdToFavoriteId,
    });
  },
  
  setLodgings: (lodgings) => {
    const state = get();
    if (!state.trip) {
      set({ lodgingsById: {}, lodgingIds: [], lodgingsByDayId: {} });
      return;
    }
    
    const normalized = normalizeTripData(state.trip, Object.values(state.favoritesById), lodgings);
    set({
      lodgingsById: normalized.lodgingsById,
      lodgingIds: normalized.lodgingIds,
      lodgingsByDayId: normalized.lodgingsByDayId,
      placeIdToLodgingId: normalized.placeIdToLodgingId,
    });
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Place selection methods
  selectPlaceFromSearch: (nominatim: NominatimResult) => {
    const state = get();
    const placeData = nominatimToPlace(nominatim);
    
    // Check if this place is already favorited or in itinerary
    // We can't check by ID since search results don't have backend IDs
    // So we check by external_id
    const existingFavorite = Object.values(state.favoritesById).find(
      fav => fav.place_details.external_id === placeData.external_id
    );
    
    const isFavorite = !!existingFavorite;
    const isInItinerary = existingFavorite 
      ? !!state.placeIdToEventIds[existingFavorite.place_details.id]
      : false;
    const isLodging = existingFavorite
      ? !!state.placeIdToLodgingId[existingFavorite.place_details.id]
      : false;
    
    set({
      selectedPlace: {
        place: existingFavorite?.place_details || { ...placeData, id: '' },
        source: 'search',
        favoriteId: existingFavorite?.id,
        isFavorite,
        isInItinerary,
        isLodging,
      },
    });
  },
  
  selectPlaceFromFavorite: (favoriteId: string) => {
    const state = get();
    const favorite = state.favoritesById[favoriteId];
    
    if (!favorite) {
      console.error('Favorite not found:', favoriteId);
      return;
    }
    
    const isInItinerary = !!state.placeIdToEventIds[favorite.place_details.id];
    const isLodging = !!state.placeIdToLodgingId[favorite.place_details.id];
    
    set({
      selectedPlace: {
        place: favorite.place_details,
        source: 'favorite',
        favoriteId: favorite.id,
        isFavorite: true,
        isInItinerary,
        isLodging,
      },
    });
  },
  
  selectPlaceFromEvent: (eventId: string) => {
    const state = get();
    const event = state.eventsById[eventId];
    
    if (!event) {
      console.error('Event not found:', eventId);
      return;
    }
    
    const favoriteId = state.placeIdToFavoriteId[event.place_details.id];
    const lodgingId = state.placeIdToLodgingId[event.place_details.id];
    
    set({
      selectedPlace: {
        place: event.place_details,
        source: 'event',
        favoriteId,
        eventId: event.id,
        tripDayId: event.trip_day,
        isFavorite: !!favoriteId,
        isInItinerary: true,
        isLodging: !!lodgingId,
      },
    });
  },
  
  selectPlaceFromLodging: (lodgingId: string) => {
    const state = get();
    const lodging = state.lodgingsById[lodgingId];
    
    if (!lodging) {
      console.error('Lodging not found:', lodgingId);
      return;
    }
    
    const favoriteId = state.placeIdToFavoriteId[lodging.place_details.id];
    
    set({
      selectedPlace: {
        place: lodging.place_details,
        source: 'lodging',
        favoriteId,
        lodgingId: lodging.id,
        isFavorite: !!favoriteId,
        isInItinerary: false,
        isLodging: true,
      },
    });
  },
  
  clearSelectedPlace: () => set({ selectedPlace: null }),
  
  // CRUD operations
  addFavorite: async (tripId: string, placeOrNominatim: NominatimResult | Place) => {
    const state = get();
    
    // Convert to place data format
    let placeData: Omit<Place, 'id'>;
    if ('place_id' in placeOrNominatim) {
      // It's a NominatimResult
      placeData = nominatimToPlace(placeOrNominatim);
    } else {
      // It's already a Place
      placeData = {
        external_id: placeOrNominatim.external_id,
        name: placeOrNominatim.name,
        address: placeOrNominatim.address,
        latitude: placeOrNominatim.latitude,
        longitude: placeOrNominatim.longitude,
        description: placeOrNominatim.description,
      };
    }
    
    try {
      // Call API
      await api.post(`/trips/${tripId}/saved-places/`, {
        place: {
          external_id: placeData.external_id,
          latitude: parseFloat(placeData.latitude),
          longitude: parseFloat(placeData.longitude),
          name: placeData.name,
          address: placeData.address,
        },
      });
      
      // Refetch favorites to get the new ID
      const savedPlacesData = await api.get(`/trips/${tripId}/saved-places/`);
      get().setFavorites(savedPlacesData);
      
      // Update selected place if it's the same one
      const updatedState = get();
      if (updatedState.selectedPlace?.place.external_id === placeData.external_id) {
        // Find the newly added favorite by external_id
        const newFavorite = Object.values(updatedState.favoritesById).find(
          fav => fav.place_details.external_id === placeData.external_id
        );
        if (newFavorite) {
          get().selectPlaceFromFavorite(newFavorite.id);
        }
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  },
  
  removeFavorite: async (tripId: string, favoriteId: string) => {
    const state = get();
    const removedFavorite = state.favoritesById[favoriteId];
    
    if (!removedFavorite) {
      console.error('Favorite not found:', favoriteId);
      return;
    }
    
    console.log('Removing favorite:', favoriteId, 'from trip:', tripId);
    
    // Store original state for rollback
    const originalFavorites = Object.values(state.favoritesById);
    const originalSelectedPlace = state.selectedPlace;
    
    try {
      // Optimistically remove from store
      const updatedFavorites = originalFavorites.filter(fav => fav.id !== favoriteId);
      console.log('Optimistically updated favorites count:', updatedFavorites.length);
      get().setFavorites(updatedFavorites);
      
      // Update selected place if it was the removed favorite
      if (state.selectedPlace?.favoriteId === favoriteId) {
        console.log('Updating selected place, source:', state.selectedPlace.source);
        // If it's from search, keep it selected but update favorite status
        if (state.selectedPlace.source === 'search') {
          set({
            selectedPlace: {
              ...state.selectedPlace,
              favoriteId: undefined,
              isFavorite: false,
            },
          });
        } else {
          // If it was opened from favorites tab, close it
          get().clearSelectedPlace();
        }
      }
      
      // Call API
      console.log('Calling DELETE API:', `/trips/${tripId}/saved-places/${favoriteId}/`);
      await api.delete(`/trips/${tripId}/saved-places/${favoriteId}/`);
      console.log('DELETE API successful');
      
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      // Rollback on error
      console.log('Rolling back favorites');
      get().setFavorites(originalFavorites);
      
      // Restore selected place state
      if (originalSelectedPlace) {
        set({ selectedPlace: originalSelectedPlace });
      }
      
      throw error;
    }
  },
  
  addLodging: async (tripId: string, data: AccommodationFormData, place: Place) => {
    try {
      // Call API
      await api.post(`/trips/${tripId}/lodgings/`, {
        place: {
          external_id: place.external_id,
          name: place.name,
          address: place.address,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
        },
        arrival_date: data.arrival_date,
        departure_date: data.departure_date,
      });
      
      // Refetch lodgings
      const lodgingsData = await api.get(`/trips/${tripId}/lodgings/`);
      get().setLodgings(lodgingsData);
      
    } catch (error) {
      console.error('Failed to add lodging:', error);
      throw error;
    }
  },
  
  addEvent: async (tripId: string, data: EventFormData, place: Place) => {
    const state = get();
    
    try {
      // Find trip_day_pk by matching the date
      const tripDay = Object.values(state.tripDaysById).find(
        day => day.date === data.date
      );
      
      if (!tripDay) {
        throw new Error(`No trip day found for date: ${data.date}`);
      }
      
      // Call API
      await api.post(`/trips/${tripId}/events/`, {
        trip_day_pk: tripDay.id,
        place: {
          external_id: place.external_id,
          name: place.name,
          address: place.address,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
        },
        notes: data.notes || null,
        type: data.type,
      });
      
      // Refetch entire trip to get updated trip_days with new event
      const tripData = await api.get(`/trips/${tripId}/`);
      get().setTrip(tripData);
      
    } catch (error) {
      console.error('Failed to add event:', error);
      throw error;
    }
  },
  
  deleteLodging: async (tripId: string, lodgingId: string) => {
    try {
      await api.delete(`/trips/${tripId}/lodgings/${lodgingId}/`);
      
      // Refetch lodgings
      const lodgingsData = await api.get(`/trips/${tripId}/lodgings/`);
      get().setLodgings(lodgingsData);
      
    } catch (error) {
      console.error('Failed to delete lodging:', error);
      throw error;
    }
  },
  
  toggleTripPublic: async (tripId: string, isPublic: boolean) => {
    try {
      const data = await api.patch<{ is_public: boolean; public_url: string }>(`/trips/${tripId}/share/`, {
        is_public: isPublic,
      });
      
      const state = get();
      if (state.trip) {
        set({
          trip: {
            ...state.trip,
            is_public: data.is_public,
            public_url: data.public_url,
          },
        });
      }
    } catch (error) {
      console.error('Failed to toggle trip public status:', error);
      throw error;
    }
  },
  
  clearTrip: () =>
    set({
      trip: null,
      favoritesById: {},
      favoriteIds: [],
      tripDaysById: {},
      tripDayIds: [],
      eventsById: {},
      eventsByDayId: {},
      lodgingsById: {},
      lodgingIds: [],
      lodgingsByDayId: {},
      placeIdToFavoriteId: {},
      placeIdToEventIds: {},
      placeIdToLodgingId: {},
      activeTab: 'favorites',
      selectedPlace: null,
    }),
}));
