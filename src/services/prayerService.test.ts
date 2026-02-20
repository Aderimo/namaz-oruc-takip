import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePrayerTimesResponse,
  getNextPrayer,
  getSahurIftar,
  getDailyPrayerTimes,
} from './prayerService';
import type { PrayerTimes } from '../types';
import * as cache from './cacheService';

// --- Test helpers ---

function makeAladhanDayData(overrides?: Partial<Record<string, string>>) {
  return {
    timings: {
      Fajr: '05:30 (EET)',
      Sunrise: '07:00',
      Dhuhr: '12:45',
      Asr: '16:15',
      Maghrib: '19:30 (EET)',
      Isha: '21:00',
      Imsak: '05:20',
      Midnight: '00:45',
      ...overrides,
    },
    date: {
      readable: '15 Jun 2025',
      timestamp: '1750000000',
      gregorian: { date: '15-06-2025' },
    },
  };
}

const samplePrayerTimes: PrayerTimes = {
  fajr: '05:30',
  sunrise: '07:00',
  dhuhr: '12:45',
  asr: '16:15',
  maghrib: '19:30',
  isha: '21:00',
  date: '2025-06-15',
};

// --- parsePrayerTimesResponse ---

describe('parsePrayerTimesResponse', () => {
  it('6 vakti doğru parse eder ve timezone kısaltmalarını temizler', () => {
    const result = parsePrayerTimesResponse(makeAladhanDayData());

    expect(result).toEqual(samplePrayerTimes);
  });

  it('tarihi DD-MM-YYYY formatından ISO formatına dönüştürür', () => {
    const data = makeAladhanDayData();
    data.date.gregorian.date = '01-01-2026';
    const result = parsePrayerTimesResponse(data);
    expect(result.date).toBe('2026-01-01');
  });
});

// --- getNextPrayer ---

describe('getNextPrayer', () => {
  it('gün ortasında doğru sonraki vakti döndürür', () => {
    // 13:00 — sonraki vakit Asr (16:15)
    const now = new Date('2025-06-15T13:00:00');
    const result = getNextPrayer(samplePrayerTimes, now);

    expect(result.name).toBe('Asr');
    expect(result.time).toBe('16:15');
    expect(result.remainingMs).toBeGreaterThan(0);
  });

  it('sabah erken saatte Fajr döndürür', () => {
    const now = new Date('2025-06-15T03:00:00');
    const result = getNextPrayer(samplePrayerTimes, now);

    expect(result.name).toBe('Fajr');
    expect(result.time).toBe('05:30');
  });

  it('tüm vakitler geçtiyse ertesi gün Fajr döndürür', () => {
    const now = new Date('2025-06-15T23:00:00');
    const result = getNextPrayer(samplePrayerTimes, now);

    expect(result.name).toBe('Fajr');
    expect(result.time).toBe('05:30');
    expect(result.remainingMs).toBeGreaterThan(0);
  });

  it('remainingMs doğru hesaplanır', () => {
    const now = new Date('2025-06-15T12:00:00');
    const result = getNextPrayer(samplePrayerTimes, now);

    expect(result.name).toBe('Dhuhr');
    expect(result.time).toBe('12:45');
    // 45 dakika = 45 * 60 * 1000 = 2_700_000 ms
    expect(result.remainingMs).toBe(45 * 60 * 1000);
  });

  it('Isha vaktinden hemen önce Isha döndürür', () => {
    const now = new Date('2025-06-15T20:59:00');
    const result = getNextPrayer(samplePrayerTimes, now);

    expect(result.name).toBe('Isha');
    expect(result.time).toBe('21:00');
  });
});

// --- getSahurIftar ---

describe('getSahurIftar', () => {
  it('sahur = fajr, iftar = maghrib döndürür', () => {
    const result = getSahurIftar(samplePrayerTimes);

    expect(result.sahur).toBe('05:30');
    expect(result.iftar).toBe('19:30');
  });

  it('sahur fajr ile, iftar maghrib ile eşleşir', () => {
    const customTimes: PrayerTimes = {
      ...samplePrayerTimes,
      fajr: '04:15',
      maghrib: '20:00',
    };
    const result = getSahurIftar(customTimes);

    expect(result.sahur).toBe(customTimes.fajr);
    expect(result.iftar).toBe(customTimes.maghrib);
  });
});

// --- getDailyPrayerTimes (cache + API integration) ---

describe('getDailyPrayerTimes', () => {
  beforeEach(() => {
    cache.clearAll();
    vi.restoreAllMocks();
  });

  it('cache varsa API çağırmaz', async () => {
    const date = new Date('2025-06-15');
    cache.set('prayer_2025-06-15', samplePrayerTimes, 12 * 60 * 60 * 1000);

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await getDailyPrayerTimes(41.0, 29.0, date);

    expect(result).toEqual(samplePrayerTimes);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
