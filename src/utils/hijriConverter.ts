import type { HijriDate } from '../types';

/**
 * Hicri ay isimleri - Türkçe
 */
const HIJRI_MONTHS_TR = [
  'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
  'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
  'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce',
];

/**
 * Hicri ay isimleri - İngilizce
 */
const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

/**
 * Miladi tarihi Julian Day Number'a dönüştürür (tam sayı JDN).
 * Gregorian reform öncesi tarihler için Julian takvimi kullanır.
 */
function gregorianToJDN(year: number, month: number, day: number): number {
  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100.0);
  const b = year < 1583 ? 0 : 2 - a + Math.floor(a / 4.0);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    b -
    1524
  );
}

/**
 * Julian Day Number'ı Miladi tarihe dönüştürür.
 */
function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  let b = 0;
  if (jdn > 2299160) {
    const a = Math.floor((jdn - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4.0);
  }
  const bb = jdn + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  const dd = Math.floor(365.25 * cc);
  const ee = Math.floor((bb - dd) / 30.6001);
  const day = bb - dd - Math.floor(30.6001 * ee);
  let month = ee - 1;
  if (ee > 13) {
    cc += 1;
    month = ee - 13;
  }
  const year = cc - 4716;
  return { year, month, day };
}


/**
 * Hicri tarihi Julian Day Number'a dönüştürür (Kuwaiti algoritması).
 */
function hijriToJDN(year: number, month: number, day: number): number {
  return (
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    386
  );
}

/**
 * Julian Day Number'ı Hicri tarihe dönüştürür (Kuwaiti algoritması).
 * Astronomik epoch ve 30 yıllık döngü tabanlı hesaplama.
 */
function jdnToHijri(jdn: number): { year: number; month: number; day: number } {
  const y = 10631.0 / 30.0;
  const epochAstro = 1948084;
  const shift1 = 8.01 / 60.0;

  let z = jdn - epochAstro;
  const cyc = Math.floor(z / 10631.0);
  z -= 10631 * cyc;
  const j = Math.floor((z - shift1) / y);
  z -= Math.floor(j * y + shift1);

  const year = 30 * cyc + j;
  let month = Math.floor((z + 28.5001) / 29.5);
  if (month === 13) month = 12;
  const day = z - Math.floor(29.5001 * month - 29);

  return { year, month, day };
}

/**
 * Verilen locale'e göre Hicri ay ismini döndürür.
 */
function getHijriMonthName(month: number, locale: string): string {
  const months = locale.startsWith('tr') ? HIJRI_MONTHS_TR : HIJRI_MONTHS_EN;
  return months[month - 1] ?? months[0]!;
}

/**
 * Miladi tarihi Hicri tarihe dönüştürür (Kuwaiti algoritması).
 * Gregorian → JDN → Hijri
 */
export function gregorianToHijri(date: Date): HijriDate {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { year, month, day } = jdnToHijri(jdn);
  return {
    day,
    month,
    monthName: getHijriMonthName(month, 'tr'),
    year,
  };
}

/**
 * Hicri tarihi Miladi tarihe dönüştürür.
 * Hijri → JDN → Gregorian
 */
export function hijriToGregorian(hijriDate: HijriDate): Date {
  const jdn = hijriToJDN(hijriDate.year, hijriDate.month, hijriDate.day);
  const { year, month, day } = jdnToGregorian(jdn);
  return new Date(year, month - 1, day);
}

/**
 * Hicri tarihi locale'e göre formatlar.
 * TR: "15 Ramazan 1447"
 * EN: "15 Ramadan 1447"
 */
export function formatHijri(hijriDate: HijriDate, locale: string): string {
  const monthName = getHijriMonthName(hijriDate.month, locale);
  return `${hijriDate.day} ${monthName} ${hijriDate.year}`;
}
