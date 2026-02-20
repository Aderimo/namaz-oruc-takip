import type { PrayerTimes } from '../types';
import { fetchWithRateLimit } from '../utils/apiClient';
import * as cache from './cacheService';

// Aladhan API - Method 13 = Diyanet İşleri Başkanlığı
const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat

interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

interface AladhanDateInfo {
  readable: string;
  timestamp: string;
  gregorian: { date: string };
}

interface AladhanDayData {
  timings: AladhanTimings;
  date: AladhanDateInfo;
}

interface AladhanDailyResponse {
  code: number;
  status: string;
  data: AladhanDayData;
}

interface AladhanMonthlyResponse {
  code: number;
  status: string;
  data: AladhanDayData[];
}

/**
 * Aladhan API yanıtından "HH:mm" formatında saat çıkarır.
 * API bazen "(EET)" gibi timezone kısaltmaları ekler, bunları temizler.
 */
function cleanTimeString(raw: string): string {
  return raw.replace(/\s*\(.*\)/, '').trim();
}

/**
 * Aladhan API yanıtını PrayerTimes nesnesine dönüştürür.
 * 6 vakti kronolojik sırada çıkarır.
 */
export function parsePrayerTimesResponse(data: AladhanDayData): PrayerTimes {
  const { timings, date: dateInfo } = data;

  // Gregorian date: DD-MM-YYYY → YYYY-MM-DD (ISO)
  const [dd, mm, yyyy] = dateInfo.gregorian.date.split('-');
  const isoDate = `${yyyy}-${mm}-${dd}`;

  return {
    fajr: cleanTimeString(timings.Fajr),
    sunrise: cleanTimeString(timings.Sunrise),
    dhuhr: cleanTimeString(timings.Dhuhr),
    asr: cleanTimeString(timings.Asr),
    maghrib: cleanTimeString(timings.Maghrib),
    isha: cleanTimeString(timings.Isha),
    date: isoDate,
  };
}

/**
 * Sonraki namaz vaktini hesaplar.
 * Tüm vakitler geçmişse ertesi günün ilk vakti (fajr) döner.
 */
export function getNextPrayer(
  times: PrayerTimes,
  currentTime?: Date,
): { name: string; time: string; remainingMs: number } {
  const now = currentTime ?? new Date();
  const todayStr = times.date; // YYYY-MM-DD

  const prayerEntries: { name: string; time: string }[] = [
    { name: 'Fajr', time: times.fajr },
    { name: 'Sunrise', time: times.sunrise },
    { name: 'Dhuhr', time: times.dhuhr },
    { name: 'Asr', time: times.asr },
    { name: 'Maghrib', time: times.maghrib },
    { name: 'Isha', time: times.isha },
  ];

  for (const prayer of prayerEntries) {
    const prayerDate = new Date(`${todayStr}T${prayer.time}:00`);
    const remainingMs = prayerDate.getTime() - now.getTime();
    if (remainingMs > 0) {
      return { name: prayer.name, time: prayer.time, remainingMs };
    }
  }

  // Tüm vakitler geçmiş — ertesi günün fajr vakti
  const nextDayFajr = new Date(`${todayStr}T${times.fajr}:00`);
  nextDayFajr.setDate(nextDayFajr.getDate() + 1);
  const remainingMs = nextDayFajr.getTime() - now.getTime();

  return { name: 'Fajr', time: times.fajr, remainingMs };
}

/**
 * Sahur ve iftar vakitlerini türetir.
 * Sahur = fajr (İmsak), İftar = maghrib (Akşam)
 */
export function getSahurIftar(times: PrayerTimes): { sahur: string; iftar: string } {
  return {
    sahur: times.fajr,
    iftar: times.maghrib,
  };
}

/**
 * Tarih formatını DD-MM-YYYY olarak döndürür (Aladhan API formatı).
 */
function formatDateForApi(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Tarih için cache key oluşturur: prayer_YYYY-MM-DD
 */
function cacheKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `prayer_${yyyy}-${mm}-${dd}`;
}

/**
 * Fallback JSON'dan namaz vakitlerini yükler.
 */
async function loadFallbackPrayerTimes(): Promise<PrayerTimes | null> {
  try {
    const fallback = await import('../data/fallbackPrayerTimes.json');
    const data = fallback.default ?? fallback;
    if (data && typeof data === 'object' && 'fajr' in data) {
      return data as PrayerTimes;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Günlük namaz vakitlerini Aladhan API'den alır.
 * Önce cache kontrol eder, API başarısız olursa cache → fallback JSON sırasıyla dener.
 */
export async function getDailyPrayerTimes(
  lat: number,
  lng: number,
  date: Date,
): Promise<PrayerTimes> {
  const key = cacheKey(date);

  // 1. Cache kontrol
  const cached = cache.get<PrayerTimes>(key);
  if (cached) return cached;

  // 2. API'den al
  try {
    const dateStr = formatDateForApi(date);
    const url = `${ALADHAN_BASE}/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=13`;
    const response = await fetchWithRateLimit<AladhanDailyResponse>(url, {
      category: 'prayerTimes',
    });

    const prayerTimes = parsePrayerTimesResponse(response.data);
    cache.set(key, prayerTimes, CACHE_TTL_MS);
    return prayerTimes;
  } catch {
    // 3. API başarısız — cache'den dene (expired olsa bile)
    const staleCache = cache.get<PrayerTimes>(key);
    if (staleCache) return staleCache;

    // 4. Fallback JSON
    const fallback = await loadFallbackPrayerTimes();
    if (fallback) return fallback;

    throw new Error('Namaz vakitleri alınamadı: API, önbellek ve yedek veri başarısız.');
  }
}

/**
 * Aylık namaz vakitlerini Aladhan API'den alır.
 */
export async function getMonthlyPrayerTimes(
  lat: number,
  lng: number,
  month: number,
  year: number,
): Promise<PrayerTimes[]> {
  try {
    const url = `${ALADHAN_BASE}/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=13`;
    const response = await fetchWithRateLimit<AladhanMonthlyResponse>(url, {
      category: 'prayerTimes',
    });

    const results = response.data.map((day) => {
      const pt = parsePrayerTimesResponse(day);
      // Her günü ayrı ayrı cache'le
      const dayDate = new Date(pt.date);
      cache.set(cacheKey(dayDate), pt, CACHE_TTL_MS);
      return pt;
    });

    return results;
  } catch {
    throw new Error('Aylık namaz vakitleri alınamadı.');
  }
}
