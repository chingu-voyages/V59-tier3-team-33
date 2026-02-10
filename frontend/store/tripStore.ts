import { create } from 'zustand';
import { Trip, SavedPlace, TabId } from '@/types/trip';

interface TripState {
  // Trip data
  trip: Trip | null;
  favorites: SavedPlace[];
  
  // UI state
  activeTab: TabId;
  
  // Actions
  setTrip: (trip: Trip) => void;
  setFavorites: (favorites: SavedPlace[]) => void;
  setActiveTab: (tab: TabId) => void;
  addFavorite: (place: SavedPlace) => void;
  removeFavorite: (placeId: string) => void;
  clearTrip: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  // Initial state
  trip: null,
  favorites: [],
  activeTab: 'favorites',
  
  // Actions
  setTrip: (trip) => set({ trip }),
  
  setFavorites: (favorites) => set({ favorites }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  addFavorite: (place) =>
    set((state) => ({
      favorites: [...state.favorites, place],
    })),
  
  removeFavorite: (placeId) =>
    set((state) => ({
      favorites: state.favorites.filter((p) => p.id !== placeId),
    })),
  
  clearTrip: () =>
    set({
      trip: null,
      favorites: [],
      activeTab: 'favorites',
    }),
}));
