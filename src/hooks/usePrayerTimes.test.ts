import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrayerTimes } from './usePrayerTimes';
import { useLocationStore } from '../stores/locationStore';
import { usePrayerStore } from '../stores/prayerStore';

// Store'ları mock'la
vi.mock('../stores/locationStore', () => ({
  useLocationStore: vi.fn(),
}));

vi.mock('../stores/prayerStore', () => ({
  usePrayerStore: vi.fn(),
}));

describe('usePrayerTimes', () => {
  const mockFetchPrayerTimes = vi.fn();
  const mockLocation = {
    country: 'Türkiye',
    countryCode: 'TR',
    city: 'İstanbul',
    latitude: 41.0082,
    longitude: 28.9784,
    timezone: 'Europe/Istanbul',
  };
  const mockTimes = {
    fajr: '05:30',
    sunrise: '07:00',
    dhuhr: '12:30',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
    date: '2025-01-15',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    const locationMockFn = vi.mocked(useLocationStore);
    locationMockFn.mockImplementation((selector: unknown) => {
      const state = { location: mockLocation };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    });

    const prayerMockFn = vi.mocked(usePrayerStore);
    prayerMockFn.mockImplementation((selector: unknown) => {
      const state = {
        todayTimes: mockTimes,
        nextPrayer: { name: 'Dhuhr', time: '12:30', remainingMs: 3600000 },
        isLoading: false,
        dataSource: 'api' as const,
        fetchPrayerTimes: mockFetchPrayerTimes,
      };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    });
  });

  it('konum mevcut olduğunda namaz vakitlerini döndürür', () => {
    const { result } = renderHook(() => usePrayerTimes());

    expect(result.current.times).toEqual(mockTimes);
    expect(result.current.nextPrayer).toEqual({ name: 'Dhuhr', time: '12:30', remainingMs: 3600000 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.dataSource).toBe('api');
  });

  it('konum mevcut olduğunda otomatik fetch tetikler', () => {
    renderHook(() => usePrayerTimes());

    expect(mockFetchPrayerTimes).toHaveBeenCalledWith(41.0082, 28.9784);
  });

  it('konum yoksa fetch tetiklemez', () => {
    const locationMockFn = vi.mocked(useLocationStore);
    locationMockFn.mockImplementation((selector: unknown) => {
      const state = { location: null };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    });

    renderHook(() => usePrayerTimes());

    expect(mockFetchPrayerTimes).not.toHaveBeenCalled();
  });

  it('refresh fonksiyonu fetch tetikler', () => {
    const { result } = renderHook(() => usePrayerTimes());

    act(() => {
      result.current.refresh();
    });

    // İlk render + refresh = 2 çağrı
    expect(mockFetchPrayerTimes).toHaveBeenCalledTimes(2);
  });
});
