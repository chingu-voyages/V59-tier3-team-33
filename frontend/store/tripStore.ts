import { create } from 'zustand';
import { Trip, SavedPlace, TabId, TripDay, Event, PlaceContext, Place } from '@/types/trip';
import type { NominatimResult } from '@/services/nominatim';
import { api } from '@/lib/api';

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
  
  // Reverse lookups
  placeIdToFavoriteId: Record<string, string>;
  placeIdToEventIds: Record<string, string[]>;
  
  // UI state
  activeTab: TabId;
  selectedPlace: PlaceContext | null;
  
  // Actions
  setTrip: (trip: Trip) => void;
  setFavorites: (favorites: SavedPlace[]) => void;
  setActiveTab: (tab: TabId) => void;
  
  // Place selection
  selectPlaceFromSearch: (place: NominatimResult) => void;
  selectPlaceFromFavorite: (favoriteId: string) => void;
  selectPlaceFromEvent: (eventId: string) => void;
  clearSelectedPlace: () => void;
  
  // CRUD operations
  addFavorite: (tripId: string, place: NominatimResult) => Promise<void>;
  removeFavorite: (tripId: string, favoriteId: string) => Promise<void>;
  
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
function normalizeTripData(trip: Trip, favorites: SavedPlace[]) {
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
  
  return {
    favoritesById,
    favoriteIds,
    tripDaysById,
    tripDayIds,
    eventsById,
    eventsByDayId,
    placeIdToFavoriteId,
    placeIdToEventIds,
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
  placeIdToFavoriteId: {},
  placeIdToEventIds: {},
  activeTab: 'favorites',
  selectedPlace: null,
  
  // Actions
  setTrip: (trip) => {
    const state = get();
    const normalized = normalizeTripData(trip, Object.values(state.favoritesById));
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
    
    const normalized = normalizeTripData(state.trip, favorites);
    set({
      favoritesById: normalized.favoritesById,
      favoriteIds: normalized.favoriteIds,
      placeIdToFavoriteId: normalized.placeIdToFavoriteId,
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
    
    set({
      selectedPlace: {
        place: existingFavorite?.place_details || { ...placeData, id: '' },
        source: 'search',
        favoriteId: existingFavorite?.id,
        isFavorite,
        isInItinerary,
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
    
    set({
      selectedPlace: {
        place: favorite.place_details,
        source: 'favorite',
        favoriteId: favorite.id,
        isFavorite: true,
        isInItinerary,
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
    
    set({
      selectedPlace: {
        place: event.place_details,
        source: 'event',
        favoriteId,
        eventId: event.id,
        tripDayId: event.trip_day,
        isFavorite: !!favoriteId,
        isInItinerary: true,
      },
    });
  },
  
  clearSelectedPlace: () => set({ selectedPlace: null }),
  
  // CRUD operations
  addFavorite: async (tripId: string, nominatim: NominatimResult) => {
    const state = get();
    const placeData = nominatimToPlace(nominatim);
    
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
  
  clearTrip: () =>
    set({
      trip: null,
      favoritesById: {},
      favoriteIds: [],
      tripDaysById: {},
      tripDayIds: [],
      eventsById: {},
      eventsByDayId: {},
      placeIdToFavoriteId: {},
      placeIdToEventIds: {},
      activeTab: 'favorites',
      selectedPlace: null,
    }),
}));
