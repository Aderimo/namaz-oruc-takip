import type { LocationData } from '../types';
import { fetchWithRateLimit } from '../utils/apiClient';
import * as cacheService from './cacheService';

const LOCATION_CACHE_KEY = 'location';
const LOCATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat
const IP_API_URL = 'http://ip-api.com/json/';

// Varsayılan İstanbul konumu
const DEFAULT_LOCATION: LocationData = {
  country: 'Türkiye',
  countryCode: 'TR',
  city: 'İstanbul',
  latitude: 41.0082,
  longitude: 28.9784,
  timezone: 'Europe/Istanbul',
};

// Şehir arama listesi — Türkiye'nin büyük şehirleri + birkaç uluslararası şehir
const CITY_LIST: LocationData[] = [
  { country: 'Türkiye', countryCode: 'TR', city: 'İstanbul', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Ankara', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'İzmir', latitude: 38.4192, longitude: 27.1287, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Bursa', latitude: 40.1885, longitude: 29.0610, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Antalya', latitude: 36.8969, longitude: 30.7133, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Adana', latitude: 37.0000, longitude: 35.3213, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Konya', latitude: 37.8746, longitude: 32.4932, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Gaziantep', latitude: 37.0662, longitude: 37.3833, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Diyarbakır', latitude: 37.9144, longitude: 40.2306, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Kayseri', latitude: 38.7312, longitude: 35.4787, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Trabzon', latitude: 41.0027, longitude: 39.7168, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Samsun', latitude: 41.2867, longitude: 36.3300, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Eskişehir', latitude: 39.7767, longitude: 30.5206, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Mersin', latitude: 36.8121, longitude: 34.6415, timezone: 'Europe/Istanbul' },
  { country: 'Türkiye', countryCode: 'TR', city: 'Erzurum', latitude: 39.9055, longitude: 41.2658, timezone: 'Europe/Istanbul' },
  // Uluslararası şehirler
  { country: 'Germany', countryCode: 'DE', city: 'Berlin', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { country: 'United Kingdom', countryCode: 'GB', city: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { country: 'France', countryCode: 'FR', city: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { country: 'United States', countryCode: 'US', city: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { country: 'Saudi Arabia', countryCode: 'SA', city: 'Mecca', latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh' },
];

/**
 * ip-api.com API yanıtını LocationData'ya dönüştürür.
 * Test edilebilirlik için ayrı export edilmiştir.
 */
export function parseLocationResponse(data: unknown): LocationData {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('status' in data) ||
    (data as Record<string, unknown>).status !== 'success'
  ) {
    throw new Error('Invalid API response');
  }

  const d = data as Record<string, unknown>;

  const country = typeof d.country === 'string' ? d.country : '';
  const countryCode = typeof d.countryCode === 'string' ? d.countryCode : '';
  const city = typeof d.city === 'string' ? d.city : '';
  const latitude = typeof d.lat === 'number' ? d.lat : 0;
  const longitude = typeof d.lon === 'number' ? d.lon : 0;
  const timezone = typeof d.timezone === 'string' ? d.timezone : '';

  if (!country || !city || !timezone) {
    throw new Error('Missing required fields in API response');
  }

  return { country, countryCode, city, latitude, longitude, timezone };
}

/**
 * Varsayılan İstanbul konumunu döndürür.
 */
export function getDefaultLocation(): LocationData {
  return { ...DEFAULT_LOCATION };
}

/**
 * IP tabanlı konum tespiti yapar.
 * Önce cache kontrol eder, yoksa API'ye istek atar.
 * Başarısız olursa varsayılan İstanbul konumunu döndürür.
 */
export async function detectLocation(): Promise<LocationData> {
  // Önce cache'e bak
  const cached = cacheService.get<LocationData>(LOCATION_CACHE_KEY);
  if (cached) return cached;

  try {
    const data = await fetchWithRateLimit<unknown>(IP_API_URL, {
      category: 'geolocation',
    });

    const location = parseLocationResponse(data);
    cacheService.set(LOCATION_CACHE_KEY, location, LOCATION_TTL_MS);
    return location;
  } catch {
    // API başarısız — varsayılan İstanbul
    return getDefaultLocation();
  }
}

/**
 * Şehir arama — hardcoded listeyi filtreler.
 * Büyük/küçük harf ve Türkçe karakter duyarsız arama yapar.
 */
export function searchCity(query: string): LocationData[] {
  if (!query || query.trim().length === 0) return [];

  const normalised = query
    .toLocaleLowerCase('tr-TR')
    .trim();

  return CITY_LIST.filter((c) =>
    c.city.toLocaleLowerCase('tr-TR').includes(normalised) ||
    c.country.toLocaleLowerCase('tr-TR').includes(normalised),
  );
}
