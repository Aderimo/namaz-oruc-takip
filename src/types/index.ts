// Konum Servisi Tipleri
export interface LocationData {
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Namaz Servisi Tipleri
export interface PrayerTimes {
  fajr: string;      // İmsak
  sunrise: string;   // Güneş
  dhuhr: string;     // Öğle
  asr: string;       // İkindi
  maghrib: string;   // Akşam
  isha: string;      // Yatsı
  date: string;      // ISO tarih
}

// Hicri Takvim Tipleri
export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
}

// Dini Günler Tipleri
export interface ReligiousDay {
  name: string;
  nameEn: string;
  hijriDate: HijriDate;
  gregorianDate: string;
  type: 'kandil' | 'bayram' | 'ozel';
  description?: string;
}

// Tatil Tipleri
export interface Holiday {
  name: string;
  nameEn?: string;
  date: string;
  countryCode: string;
  type: 'national' | 'religious' | 'public';
}

// Önbellek Tipleri
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
