import { useCallback } from 'react';
import { useLocationStore } from '../stores/locationStore';
import { searchCity as searchCityService } from '../services/locationService';
import type { LocationData } from '../types';

interface UseLocationResult {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  detect: () => Promise<void>;
  setLocation: (location: LocationData) => void;
  searchCity: (query: string) => LocationData[];
}

/**
 * Konum tespiti ve yönetimi hook'u.
 * locationStore'u sarmalayarak bileşenlere temiz bir arayüz sunar.
 */
export function useLocation(): UseLocationResult {
  const location = useLocationStore((s) => s.location);
  const isLoading = useLocationStore((s) => s.isLoading);
  const error = useLocationStore((s) => s.error);
  const storeDetect = useLocationStore((s) => s.detectLocation);
  const storeSetLocation = useLocationStore((s) => s.setLocation);

  const detect = useCallback(async () => {
    await storeDetect();
  }, [storeDetect]);

  const setLocation = useCallback(
    (loc: LocationData) => {
      storeSetLocation(loc);
    },
    [storeSetLocation],
  );

  const searchCity = useCallback((query: string): LocationData[] => {
    return searchCityService(query);
  }, []);

  return {
    location,
    isLoading,
    error,
    detect,
    setLocation,
    searchCity,
  };
}
