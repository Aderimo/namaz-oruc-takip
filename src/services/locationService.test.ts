import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseLocationResponse,
  getDefaultLocation,
  detectLocation,
  searchCity,
} from './locationService';
import * as cacheService from './cacheService';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('locationService', () => {
  describe('parseLocationResponse', () => {
    it('parses a valid ip-api.com response', () => {
      const apiResponse = {
        status: 'success',
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        lat: 52.52,
        lon: 13.405,
        timezone: 'Europe/Berlin',
      };

      const result = parseLocationResponse(apiResponse);

      expect(result).toEqual({
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        latitude: 52.52,
        longitude: 13.405,
        timezone: 'Europe/Berlin',
      });
    });

    it('parses a valid ipapi.co response', () => {
      const apiResponse = {
        country_name: 'Turkey',
        country_code: 'TR',
        city: 'Istanbul',
        latitude: 41.0082,
        longitude: 28.9784,
        timezone: 'Europe/Istanbul',
      };

      const result = parseLocationResponse(apiResponse);

      expect(result).toEqual({
        country: 'Turkey',
        countryCode: 'TR',
        city: 'Istanbul',
        latitude: 41.0082,
        longitude: 28.9784,
        timezone: 'Europe/Istanbul',
      });
    });

    it('throws on invalid response', () => {
      expect(() => parseLocationResponse({ status: 'fail' })).toThrow('Invalid API response');
    });

    it('throws on null input', () => {
      expect(() => parseLocationResponse(null)).toThrow('Invalid API response');
    });

    it('throws on missing required fields (ip-api format)', () => {
      const incomplete = {
        status: 'success',
        country: '',
        countryCode: 'XX',
        city: 'Test',
        lat: 0,
        lon: 0,
        timezone: 'UTC',
      };
      expect(() => parseLocationResponse(incomplete)).toThrow('Missing required fields');
    });

    it('throws when city is missing (ipapi.co format)', () => {
      const noCity = {
        country_name: 'Turkey',
        country_code: 'TR',
        city: '',
        latitude: 41,
        longitude: 29,
        timezone: 'Europe/Istanbul',
      };
      expect(() => parseLocationResponse(noCity)).toThrow('Missing required fields');
    });
  });

  describe('getDefaultLocation', () => {
    it('returns Istanbul as default', () => {
      const loc = getDefaultLocation();
      expect(loc.city).toBe('İstanbul');
      expect(loc.countryCode).toBe('TR');
      expect(loc.latitude).toBe(41.0082);
      expect(loc.longitude).toBe(28.9784);
      expect(loc.timezone).toBe('Europe/Istanbul');
    });

    it('returns a new object each time (no shared reference)', () => {
      const a = getDefaultLocation();
      const b = getDefaultLocation();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe('detectLocation', () => {
    it('returns cached location if available', async () => {
      const cached = {
        country: 'France',
        countryCode: 'FR',
        city: 'Paris',
        latitude: 48.85,
        longitude: 2.35,
        timezone: 'Europe/Paris',
      };
      cacheService.set('location', cached, 60_000);

      const result = await detectLocation();
      expect(result).toEqual(cached);
    });

    it('returns default Istanbul when API fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await detectLocation();
      expect(result.city).toBe('İstanbul');
      expect(result.countryCode).toBe('TR');
    });

    it('caches successful API response', async () => {
      const apiResponse = {
        status: 'success',
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        lat: 52.52,
        lon: 13.405,
        timezone: 'Europe/Berlin',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      } as Response);

      const result = await detectLocation();
      expect(result.city).toBe('Berlin');

      // Verify it was cached
      const cached = cacheService.get('location');
      expect(cached).toEqual(result);
    });
  });

  describe('searchCity', () => {
    it('finds İstanbul by name', () => {
      const results = searchCity('istanbul');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0]?.city).toBe('İstanbul');
    });

    it('finds cities by partial match', () => {
      const results = searchCity('ank');
      expect(results.some((c) => c.city === 'Ankara')).toBe(true);
    });

    it('is case insensitive', () => {
      const results = searchCity('ANKARA');
      expect(results.some((c) => c.city === 'Ankara')).toBe(true);
    });

    it('finds international cities', () => {
      const results = searchCity('Berlin');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0]?.city).toBe('Berlin');
    });

    it('searches by country name too', () => {
      const results = searchCity('France');
      expect(results.some((c) => c.city === 'Paris')).toBe(true);
    });

    it('returns empty array for empty query', () => {
      expect(searchCity('')).toEqual([]);
      expect(searchCity('   ')).toEqual([]);
    });

    it('returns empty array for no matches', () => {
      expect(searchCity('xyznonexistent')).toEqual([]);
    });

    it('handles Turkish characters correctly', () => {
      const results = searchCity('İzmir');
      expect(results.some((c) => c.city === 'İzmir')).toBe(true);
    });
  });
});
