import type { Holiday } from '../types';
import { fetchWithRateLimit } from '../utils/apiClient';
import * as cache from './cacheService';
import turkeyHolidaysData from '../data/turkeyHolidays.json';

const NAGER_API_BASE = 'https://date.nager.at/api/v3/PublicHolidays';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface TurkeyHolidayEntry {
  name: string;
  nameEn: string;
  month: number;
  day: number;
  type: 'national' | 'religious' | 'public';
}

/**
 * Parse Nager.Date API response into Holiday[].
 * Exported separately for testing.
 */
export function parseHolidayResponse(data: unknown): Holiday[] {
  if (!Array.isArray(data)) return [];

  return data
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null,
    )
    .map((item) => {
      const name = typeof item.localName === 'string' ? item.localName : typeof item.name === 'string' ? item.name : '';
      const nameEn = typeof item.name === 'string' ? item.name : '';
      const date = typeof item.date === 'string' ? item.date : '';
      const countryCode = typeof item.countryCode === 'string' ? item.countryCode : '';

      let type: Holiday['type'] = 'public';
      if (Array.isArray(item.types)) {
        if (item.types.includes('Public')) type = 'public';
        if (item.types.includes('National')) type = 'national';
        if (item.types.includes('Religious')) type = 'religious';
      }

      return { name, nameEn, date, countryCode, type };
    })
    .filter((h) => h.name && h.date && h.countryCode);
}

/**
 * Returns Turkey's fixed national holidays for a given year.
 */
export function getTurkeyHolidays(year: number): Holiday[] {
  const entries = turkeyHolidaysData as TurkeyHolidayEntry[];

  return entries.map((entry) => {
    const month = String(entry.month).padStart(2, '0');
    const day = String(entry.day).padStart(2, '0');

    return {
      name: entry.name,
      nameEn: entry.nameEn,
      date: `${year}-${month}-${day}`,
      countryCode: 'TR',
      type: entry.type,
    };
  });
}

/**
 * Merges Turkey holidays into a holiday list, avoiding duplicates by date.
 */
function mergeTurkeyHolidays(holidays: Holiday[], year: number): Holiday[] {
  const turkeyHolidays = getTurkeyHolidays(year);
  const existingDates = new Set(
    holidays.filter((h) => h.countryCode === 'TR').map((h) => h.date),
  );

  const merged = [...holidays];
  for (const th of turkeyHolidays) {
    if (!existingDates.has(th.date)) {
      merged.push(th);
    }
  }

  return merged;
}

/**
 * Fetches holidays for a country from Nager.Date API.
 * Always merges Turkey's national holidays into the result.
 * Uses cache with 24h TTL. Falls back to Turkey holidays on API failure.
 */
export async function getHolidays(
  countryCode: string,
  year: number,
): Promise<Holiday[]> {
  const cacheKey = `holidays_${countryCode}_${year}`;

  // Check cache first
  const cached = cache.get<Holiday[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${NAGER_API_BASE}/${year}/${countryCode}`;
    const data = await fetchWithRateLimit<unknown>(url, { category: 'holidays' });
    const holidays = parseHolidayResponse(data);
    const merged = mergeTurkeyHolidays(holidays, year);

    cache.set(cacheKey, merged, CACHE_TTL_MS);
    return merged;
  } catch {
    // On API failure, return Turkey holidays as fallback
    return getTurkeyHolidays(year);
  }
}

/**
 * Returns upcoming holidays sorted by date ascending, all after referenceDate.
 */
export function getUpcomingHolidays(
  holidays: Holiday[],
  count: number,
  referenceDate: Date = new Date(),
): Holiday[] {
  const refStr = referenceDate.toISOString().slice(0, 10);

  return holidays
    .filter((h) => h.date > refStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}
