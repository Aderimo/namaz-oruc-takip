import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocationStore } from './locationStore';
import type { LocationData } from '../types';

// Mock locationService
vi.mock('../services/locationService', () => ({
  detectLocation: vi.fn(),
}));

// Mock cacheService
vi.mock('../services/cacheService', () => ({
  get: vi.fn(() => null),
  set: vi.fn(),
}));

import { detectLocation as detectLocationMock } from '../services/locationService';
import * as cacheService from '../services/cacheService';

const istanbul: LocationData = {
  country: 'Türkiye',
  countryCode: 'TR',
  city: 'İstanbul',
  latitude: 41.0082,
  longitude: 28.9784,
  timezone: 'Europe/Istanbul',
};

const ankara: LocationData = {
  country: 'Türkiye',
  countryCode: 'TR',
  city: 'Ankara',
  latitude: 39.9334,
  longitude: 32.8597,
  timezone: 'Europe/Istanbul',
};

describe('locationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Store'u sıfırla
    useLocationStore.setState({
      location: null,
      isLoading: false,
      error: null,
    });
  });

  it('başlangıç state değerleri doğru olmalı', () => {
    const state = useLocationStore.getState();
    expect(state.location).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setLocation konumu güncellemeli ve cache\'e kaydetmeli', () => {
    useLocationStore.getState().setLocation(istanbul);

    const state = useLocationStore.getState();
    expect(state.location).toEqual(istanbul);
    expect(state.error).toBeNull();
    expect(cacheService.set).toHaveBeenCalledWith(
      'location',
      istanbul,
      24 * 60 * 60 * 1000,
    );
  });

  it('detectLocation başarılı olduğunda konumu güncellemeli', async () => {
    vi.mocked(detectLocationMock).mockResolvedValue(ankara);

    await useLocationStore.getState().detectLocation();

    const state = useLocationStore.getState();
    expect(state.location).toEqual(ankara);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(cacheService.set).toHaveBeenCalledWith(
      'location',
      ankara,
      24 * 60 * 60 * 1000,
    );
  });

  it('detectLocation sırasında isLoading true olmalı', async () => {
    let resolvePromise: (val: LocationData) => void;
    const pending = new Promise<LocationData>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(detectLocationMock).mockReturnValue(pending);

    const promise = useLocationStore.getState().detectLocation();

    expect(useLocationStore.getState().isLoading).toBe(true);
    expect(useLocationStore.getState().error).toBeNull();

    resolvePromise!(istanbul);
    await promise;

    expect(useLocationStore.getState().isLoading).toBe(false);
  });

  it('detectLocation başarısız olduğunda hata mesajı set etmeli', async () => {
    vi.mocked(detectLocationMock).mockRejectedValue(new Error('Ağ hatası'));

    await useLocationStore.getState().detectLocation();

    const state = useLocationStore.getState();
    expect(state.location).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ağ hatası');
  });

  it('detectLocation başarısız olduğunda Error olmayan hata için varsayılan mesaj kullanmalı', async () => {
    vi.mocked(detectLocationMock).mockRejectedValue('bilinmeyen hata');

    await useLocationStore.getState().detectLocation();

    const state = useLocationStore.getState();
    expect(state.error).toBe('Konum tespit edilemedi');
  });

  it('başarılı detectLocation önceki hatayı temizlemeli', async () => {
    // Önce hata oluştur
    vi.mocked(detectLocationMock).mockRejectedValue(new Error('Hata'));
    await useLocationStore.getState().detectLocation();
    expect(useLocationStore.getState().error).toBe('Hata');

    // Sonra başarılı tespit
    vi.mocked(detectLocationMock).mockResolvedValue(istanbul);
    await useLocationStore.getState().detectLocation();

    const state = useLocationStore.getState();
    expect(state.error).toBeNull();
    expect(state.location).toEqual(istanbul);
  });
});
