import { useEffect, useCallback } from 'react';
import { useLocationStore } from '../stores/locationStore';
import { usePrayerStore } from '../stores/prayerStore';
import type { PrayerTimes } from '../types';

interface UsePrayerTimesResult {
  times: PrayerTimes | null;
  nextPrayer: { name: string; time: string; remainingMs: number } | null;
  isLoading: boolean;
  dataSource: 'api' | 'cache' | 'fallback';
  refresh: () => void;
}

/**
 * Namaz vakitlerini konum store'dan alıp prayer store üzerinden yöneten hook.
 * Konum değiştiğinde otomatik olarak yeni vakitleri çeker.
 */
export function usePrayerTimes(): UsePrayerTimesResult {
  const location = useLocationStore((s) => s.location);
  const todayTimes = usePrayerStore((s) => s.todayTimes);
  const nextPrayer = usePrayerStore((s) => s.nextPrayer);
  const isLoading = usePrayerStore((s) => s.isLoading);
  const dataSource = usePrayerStore((s) => s.dataSource);
  const fetchPrayerTimes = usePrayerStore((s) => s.fetchPrayerTimes);

  const refresh = useCallback(() => {
    if (location) {
      fetchPrayerTimes(location.latitude, location.longitude);
    }
  }, [location, fetchPrayerTimes]);

  // Konum değiştiğinde otomatik fetch
  useEffect(() => {
    if (location) {
      fetchPrayerTimes(location.latitude, location.longitude);
    }
  }, [location, fetchPrayerTimes]);

  return {
    times: todayTimes,
    nextPrayer,
    isLoading,
    dataSource,
    refresh,
  };
}
