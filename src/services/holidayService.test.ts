import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseHolidayResponse,
  getTurkeyHolidays,
  getHolidays,
  getUpcomingHolidays,
} from './holidayService';
import * as cacheService from './cacheService';
import type { Holiday } from '../types';

// Mock apiClient
vi.mock('../utils/apiClient', () => ({
  fetchWithRateLimit: vi.fn(),
}));

import { fetchWithRateLimit } from '../utils/apiClient';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('holidayService', () => {
  describe('parseHolidayResponse', () => {
    it('parses a valid Nager.Date API response', () => {
      const apiData = [
        {
          date: '2025-01-01',
          localName: 'Yılbaşı',
          name: "New Year's Day",
          countryCode: 'TR',
          types: ['Public'],
        },
        {
          date: '2025-04-23',
          localName: 'Ulusal Egemenlik ve Çocuk Bayramı',
          name: 'National Sovereignty and Children\'s Day',
          countryCode: 'TR',
          types: ['National'],
        },
      ];

      const result = parseHolidayResponse(apiData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Yılbaşı',
        nameEn: "New Year's Day",
        date: '2025-01-01',
        countryCode: 'TR',
        type: 'public',
      });
      expect(result[1]).toEqual({
        name: 'Ulusal Egemenlik ve Çocuk Bayramı',
        nameEn: 'National Sovereignty and Children\'s Day',
        date: '2025-04-23',
        countryCode: 'TR',
        type: 'national',
      });
    });

    it('returns empty array for non-array input', () => {
      expect(parseHolidayResponse(null)).toEqual([]);
      expect(parseHolidayResponse(undefined)).toEqual([]);
      expect(parseHolidayResponse('string')).toEqual([]);
      expect(parseHolidayResponse(42)).toEqual([]);
    });

    it('filters out items with missing required fields', () => {
      const data = [
        { date: '2025-01-01', localName: '', countryCode: 'TR', types: ['Public'] },
        { date: '', localName: 'Test', countryCode: 'TR', types: ['Public'] },
        { date: '2025-01-01', localName: 'Valid', countryCode: 'DE', types: ['Public'] },
      ];

      const result = parseHolidayResponse(data);
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Valid');
    });

    it('falls back to name when localName is missing', () => {
      const data = [
        { date: '2025-12-25', name: 'Christmas Day', countryCode: 'US', types: ['Public'] },
      ];

      const result = parseHolidayResponse(data);
      expect(result[0]!.name).toBe('Christmas Day');
    });

    it('handles religious type correctly', () => {
      const data = [
        { date: '2025-03-30', localName: 'Ramazan Bayramı', countryCode: 'TR', types: ['Religious'] },
      ];

      const result = parseHolidayResponse(data);
      expect(result[0]!.type).toBe('religious');
    });
  });

  describe('getTurkeyHolidays', () => {
    it('returns 4 national holidays for any year', () => {
      const holidays = getTurkeyHolidays(2025);
      expect(holidays).toHaveLength(4);
      holidays.forEach((h) => {
        expect(h.countryCode).toBe('TR');
        expect(h.type).toBe('national');
      });
    });

    it('formats dates correctly for the given year', () => {
      const holidays = getTurkeyHolidays(2025);
      const dates = holidays.map((h) => h.date);

      expect(dates).toContain('2025-04-23');
      expect(dates).toContain('2025-05-19');
      expect(dates).toContain('2025-08-30');
      expect(dates).toContain('2025-10-29');
    });

    it('includes correct holiday names', () => {
      const holidays = getTurkeyHolidays(2025);
      const names = holidays.map((h) => h.name);

      expect(names).toContain('Ulusal Egemenlik ve Çocuk Bayramı');
      expect(names).toContain('Atatürk\'ü Anma, Gençlik ve Spor Bayramı');
      expect(names).toContain('Zafer Bayramı');
      expect(names).toContain('Cumhuriyet Bayramı');
    });

    it('works for different years', () => {
      const h2024 = getTurkeyHolidays(2024);
      const h2026 = getTurkeyHolidays(2026);

      expect(h2024[0]!.date).toBe('2024-04-23');
      expect(h2026[0]!.date).toBe('2026-04-23');
    });
  });

  describe('getHolidays', () => {
    it('returns cached data if available', async () => {
      const cached: Holiday[] = [
        { name: 'Cached Holiday', date: '2025-01-01', countryCode: 'TR', type: 'public' },
      ];
      cacheService.set('holidays_TR_2025', cached, 60_000);

      const result = await getHolidays('TR', 2025);
      expect(result).toEqual(cached);
      expect(fetchWithRateLimit).not.toHaveBeenCalled();
    });

    it('fetches from API and merges Turkey holidays', async () => {
      const apiResponse = [
        { date: '2025-01-01', localName: 'Yılbaşı', countryCode: 'TR', types: ['Public'] },
      ];

      vi.mocked(fetchWithRateLimit).mockResolvedValue(apiResponse);

      const result = await getHolidays('TR', 2025);

      // Should have API holiday + 4 Turkey national holidays
      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.some((h) => h.name === 'Yılbaşı')).toBe(true);
      expect(result.some((h) => h.name === 'Cumhuriyet Bayramı')).toBe(true);
    });

    it('avoids duplicate Turkey holidays when API already includes them', async () => {
      const apiResponse = [
        { date: '2025-04-23', localName: 'Ulusal Egemenlik ve Çocuk Bayramı', countryCode: 'TR', types: ['National'] },
        { date: '2025-01-01', localName: 'Yılbaşı', countryCode: 'TR', types: ['Public'] },
      ];

      vi.mocked(fetchWithRateLimit).mockResolvedValue(apiResponse);

      const result = await getHolidays('TR', 2025);
      const april23 = result.filter((h) => h.date === '2025-04-23');
      expect(april23).toHaveLength(1);
    });

    it('falls back to Turkey holidays on API failure', async () => {
      vi.mocked(fetchWithRateLimit).mockRejectedValue(new Error('Network error'));

      const result = await getHolidays('DE', 2025);
      expect(result).toHaveLength(4);
      result.forEach((h) => {
        expect(h.countryCode).toBe('TR');
        expect(h.type).toBe('national');
      });
    });

    it('merges Turkey holidays for non-TR countries', async () => {
      const apiResponse = [
        { date: '2025-12-25', localName: 'Weihnachten', name: 'Christmas', countryCode: 'DE', types: ['Public'] },
      ];

      vi.mocked(fetchWithRateLimit).mockResolvedValue(apiResponse);

      const result = await getHolidays('DE', 2025);
      expect(result.some((h) => h.name === 'Weihnachten')).toBe(true);
      expect(result.some((h) => h.name === 'Cumhuriyet Bayramı')).toBe(true);
    });
  });

  describe('getUpcomingHolidays', () => {
    const holidays: Holiday[] = [
      { name: 'Past Holiday', date: '2025-01-01', countryCode: 'TR', type: 'public' },
      { name: 'Holiday C', date: '2025-12-25', countryCode: 'TR', type: 'public' },
      { name: 'Holiday A', date: '2025-06-15', countryCode: 'TR', type: 'national' },
      { name: 'Holiday B', date: '2025-08-30', countryCode: 'TR', type: 'national' },
    ];

    it('returns holidays after reference date sorted ascending', () => {
      const ref = new Date('2025-05-01');
      const result = getUpcomingHolidays(holidays, 10, ref);

      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('Holiday A');
      expect(result[1]!.name).toBe('Holiday B');
      expect(result[2]!.name).toBe('Holiday C');
    });

    it('limits results to count parameter', () => {
      const ref = new Date('2025-05-01');
      const result = getUpcomingHolidays(holidays, 2, ref);

      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe('Holiday A');
      expect(result[1]!.name).toBe('Holiday B');
    });

    it('excludes holidays on or before reference date', () => {
      const ref = new Date('2025-06-15');
      const result = getUpcomingHolidays(holidays, 10, ref);

      expect(result.every((h) => h.date > '2025-06-15')).toBe(true);
    });

    it('returns empty array when no upcoming holidays', () => {
      const ref = new Date('2026-01-01');
      const result = getUpcomingHolidays(holidays, 10, ref);
      expect(result).toEqual([]);
    });

    it('uses current date as default reference', () => {
      const futureHolidays: Holiday[] = [
        { name: 'Far Future', date: '2099-01-01', countryCode: 'TR', type: 'public' },
      ];
      const result = getUpcomingHolidays(futureHolidays, 10);
      expect(result).toHaveLength(1);
    });
  });
});
