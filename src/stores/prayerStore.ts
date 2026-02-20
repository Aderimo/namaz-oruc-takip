import { create } from 'zustand';
import type { PrayerTimes } from '../types';
import { getDailyPrayerTimes, getNextPrayer } from '../services/prayerService';
import * as cacheService from '../services/cacheService';

interface PrayerState {
  todayTimes: PrayerTimes | null;
  nextPrayer: { name: string; time: string; remainingMs: number } | null;
  isLoading: boolean;
  dataSource: 'api' | 'cache' | 'fallback';
  fetchPrayerTimes: (lat: number, lng: number) => Promise<void>;
}

function prayerCacheKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `prayer_${yyyy}-${mm}-${dd}`;
}

export const usePrayerStore = create<PrayerState>((set) => ({
  todayTimes: null,
  nextPrayer: null,
  isLoading: false,
  dataSource: 'api',

  fetchPrayerTimes: async (lat: number, lng: number) => {
    set({ isLoading: true });

    const today = new Date();
    const hadCache = cacheService.isValid(prayerCacheKey(today));

    try {
      const times = await getDailyPrayerTimes(lat, lng, today);
      const next = getNextPrayer(times);

      // Determine source: if cache existed before the call, the service
      // returned it from cache. Otherwise it came from the API.
      const dataSource: 'api' | 'cache' | 'fallback' = hadCache ? 'cache' : 'api';

      set({
        todayTimes: times,
        nextPrayer: next,
        isLoading: false,
        dataSource,
      });
    } catch {
      // getDailyPrayerTimes throws only when all sources fail.
      // If we still got here, nothing worked.
      set({ isLoading: false, dataSource: 'fallback' });
    }
  },
}));
