import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocation } from './useLocation';
import { useLocationStore } from '../stores/locationStore';
import * as locationService from '../services/locationService';

vi.mock('../stores/locationStore', () => ({
  useLocationStore: vi.fn(),
}));

vi.mock('../services/locationService', () => ({
  searchCity: vi.fn(),
}));

describe('useLocation', () => {
  const mockDetect = vi.fn();
  const mockSetLocation = vi.fn();
  const mockLocation = {
    country: 'Türkiye',
    countryCode: 'TR',
    city: 'İstanbul',
    latitude: 41.0082,
    longitude: 28.9784,
    timezone: 'Europe/Istanbul',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const locationMockFn = vi.mocked(useLocationStore);
    locationMockFn.mockImplementation((selector: unknown) => {
      const state = {
        location: mockLocation,
        isLoading: false,
        error: null,
        detectLocation: mockDetect,
        setLocation: mockSetLocation,
      };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    });
  });

  it('mevcut konum bilgisini döndürür', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current.location).toEqual(mockLocation);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('detect() konum tespitini tetikler', async () => {
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.detect();
    });

    expect(mockDetect).toHaveBeenCalledOnce();
  });

  it('setLocation() konumu günceller', () => {
    const newLocation = { ...mockLocation, city: 'Ankara', latitude: 39.9334, longitude: 32.8597 };
    const { result } = renderHook(() => useLocation());

    act(() => {
      result.current.setLocation(newLocation);
    });

    expect(mockSetLocation).toHaveBeenCalledWith(newLocation);
  });

  it('searchCity() locationService.searchCity fonksiyonunu çağırır', () => {
    const mockResults = [mockLocation];
    vi.mocked(locationService.searchCity).mockReturnValue(mockResults);

    const { result } = renderHook(() => useLocation());

    const cities = result.current.searchCity('İstanbul');

    expect(locationService.searchCity).toHaveBeenCalledWith('İstanbul');
    expect(cities).toEqual(mockResults);
  });

  it('hata durumunu doğru yansıtır', () => {
    const locationMockFn = vi.mocked(useLocationStore);
    locationMockFn.mockImplementation((selector: unknown) => {
      const state = {
        location: null,
        isLoading: false,
        error: 'Konum tespit edilemedi',
        detectLocation: mockDetect,
        setLocation: mockSetLocation,
      };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    });

    const { result } = renderHook(() => useLocation());

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('Konum tespit edilemedi');
  });
});
