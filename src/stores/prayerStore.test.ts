import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePrayerStore } from './prayerStore';

// Mock prayer service
vi.mock('../services/prayerService', () => ({
  getDailyPrayerTimes: vi.fn(),
  getNextPrayer: vi.fn(),
}));

// Mock cache service
vi.mock('../services/cacheService', () => ({
  isValid: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

import { getDailyPrayerTimes, getNextPrayer } from '../services/prayerService';
import * as cacheService from '../services/cacheService';

const mockTimes = {
  fajr: '05:30',
  sunrise: '07:00',
  dhuhr: '12:45',
  asr: '16:00',
  maghrib: '19:15',
  isha: '20:45',
  date: '2025-01-15',
};

const mockNextPrayer = { name: 'Dhuhr', time: '12:45', remainingMs: 3600000 };

describe('usePrayerStore', () => {
  beforeEach(() => {
    // Reset store state
    usePrayerStore.setState({
      todayTimes: null,
      nextPrayer: null,
      isLoading: false,
      dataSource: 'api',
    });
    vi.clearAllMocks();
  });

  it('başlangıç state değerleri doğru olmalı', () => {
    const state = usePrayerStore.getState();
    expect(state.todayTimes).toBeNull();
    expect(state.nextPrayer).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.dataSource).toBe('api');
  });

  it('fetchPrayerTimes API başarılı olduğunda state güncellenmeli', async () => {
    vi.mocked(cacheService.isValid).mockReturnValue(false);
    vi.mocked(getDailyPrayerTimes).mockResolvedValue(mockTimes);
    vi.mocked(getNextPrayer).mockReturnValue(mockNextPrayer);

    await usePrayerStore.getState().fetchPrayerTimes(41.01, 28.97);

    const state = usePrayerStore.getState();
    expect(state.todayTimes).toEqual(mockTimes);
    expect(state.nextPrayer).toEqual(mockNextPrayer);
    expect(state.isLoading).toBe(false);
    expect(state.dataSource).toBe('api');
  });

  it('fetchPrayerTimes cache varken dataSource "cache" olmalı', async () => {
    vi.mocked(cacheService.isValid).mockReturnValue(true);
    vi.mocked(getDailyPrayerTimes).mockResolvedValue(mockTimes);
    vi.mocked(getNextPrayer).mockReturnValue(mockNextPrayer);

    await usePrayerStore.getState().fetchPrayerTimes(41.01, 28.97);

    const state = usePrayerStore.getState();
    expect(state.dataSource).toBe('cache');
    expect(state.todayTimes).toEqual(mockTimes);
  });

  it('fetchPrayerTimes sırasında isLoading true olmalı', async () => {
    let resolvePromise: (value: typeof mockTimes) => void;
    const pendingPromise = new Promise<typeof mockTimes>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(cacheService.isValid).mockReturnValue(false);
    vi.mocked(getDailyPrayerTimes).mockReturnValue(pendingPromise);

    const fetchPromise = usePrayerStore.getState().fetchPrayerTimes(41.01, 28.97);

    expect(usePrayerStore.getState().isLoading).toBe(true);

    vi.mocked(getNextPrayer).mockReturnValue(mockNextPrayer);
    resolvePromise!(mockTimes);
    await fetchPromise;

    expect(usePrayerStore.getState().isLoading).toBe(false);
  });

  it('fetchPrayerTimes hata durumunda isLoading false ve dataSource fallback olmalı', async () => {
    vi.mocked(cacheService.isValid).mockReturnValue(false);
    vi.mocked(getDailyPrayerTimes).mockRejectedValue(new Error('API failed'));

    await usePrayerStore.getState().fetchPrayerTimes(41.01, 28.97);

    const state = usePrayerStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.dataSource).toBe('fallback');
    expect(state.todayTimes).toBeNull();
  });

  it('getNextPrayer sonucu doğru hesaplanmalı', async () => {
    const customNext = { name: 'Maghrib', time: '19:15', remainingMs: 7200000 };
    vi.mocked(cacheService.isValid).mockReturnValue(false);
    vi.mocked(getDailyPrayerTimes).mockResolvedValue(mockTimes);
    vi.mocked(getNextPrayer).mockReturnValue(customNext);

    await usePrayerStore.getState().fetchPrayerTimes(41.01, 28.97);

    expect(usePrayerStore.getState().nextPrayer).toEqual(customNext);
    expect(getNextPrayer).toHaveBeenCalledWith(mockTimes);
  });
});
