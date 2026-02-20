import { create } from 'zustand';
import type { LocationData } from '../types';
import { detectLocation as detectLocationFromService } from '../services/locationService';
import * as cacheService from '../services/cacheService';

const LOCATION_CACHE_KEY = 'location';
const LOCATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

interface LocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (location: LocationData) => void;
  detectLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  // Başlangıçta localStorage'dan kayıtlı konumu yükle
  location: cacheService.get<LocationData>(LOCATION_CACHE_KEY),
  isLoading: false,
  error: null,

  setLocation: (location: LocationData) => {
    cacheService.set(LOCATION_CACHE_KEY, location, LOCATION_TTL_MS);
    set({ location, error: null });
  },

  detectLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const location = await detectLocationFromService();
      cacheService.set(LOCATION_CACHE_KEY, location, LOCATION_TTL_MS);
      set({ location, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Konum tespit edilemedi';
      set({ isLoading: false, error: message });
    }
  },
}));
