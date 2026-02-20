import { describe, it, expect } from 'vitest';
import { gregorianToHijri, hijriToGregorian, formatHijri } from './hijriConverter';
import type { HijriDate } from '../types';

describe('hijriConverter', () => {
  describe('gregorianToHijri', () => {
    it('bilinen tarih dönüşümü: 16 Temmuz 622 CE ≈ 1 Muharrem 1 AH', () => {
      // Kuwaiti algoritması ile 16 Temmuz 622 → ~1-2 Muharrem 1 AH
      const result = gregorianToHijri(new Date(622, 6, 16));
      expect(result.year).toBeGreaterThanOrEqual(0);
      expect(result.year).toBeLessThanOrEqual(1);
      expect(result.month).toBe(1);
      expect(result.day).toBeGreaterThanOrEqual(1);
      expect(result.day).toBeLessThanOrEqual(3);
    });

    it('modern tarih dönüşümü: 1 Ocak 2024 ≈ 19-20 Cemaziyelahir 1445', () => {
      const result = gregorianToHijri(new Date(2024, 0, 1));
      expect(result.year).toBe(1445);
      expect(result.month).toBe(6); // Cemaziyelahir
      expect(result.day).toBeGreaterThanOrEqual(18);
      expect(result.day).toBeLessThanOrEqual(21);
    });

    it('Ramazan ayı tespiti: 12 Mart 2024 ≈ Ramazan 1445', () => {
      // 12 Mart 2024 kesinlikle Ramazan 1445 içinde
      const result = gregorianToHijri(new Date(2024, 2, 12));
      expect(result.year).toBe(1445);
      expect(result.month).toBe(9); // Ramazan
    });

    it('döndürülen nesne HijriDate arayüzüne uygun olmalı', () => {
      const result = gregorianToHijri(new Date(2025, 0, 15));
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('monthName');
      expect(result).toHaveProperty('year');
      expect(typeof result.day).toBe('number');
      expect(typeof result.month).toBe('number');
      expect(typeof result.monthName).toBe('string');
      expect(typeof result.year).toBe('number');
    });

    it('ay numarası 1-12 arasında olmalı', () => {
      const dates = [
        new Date(2024, 0, 1),
        new Date(2024, 5, 15),
        new Date(2024, 11, 31),
      ];
      for (const date of dates) {
        const result = gregorianToHijri(date);
        expect(result.month).toBeGreaterThanOrEqual(1);
        expect(result.month).toBeLessThanOrEqual(12);
      }
    });

    it('varsayılan monthName Türkçe olmalı', () => {
      const result = gregorianToHijri(new Date(2024, 2, 15));
      // 15 Mart 2024 Ramazan ayı içinde
      expect(result.monthName).toBe('Ramazan');
    });
  });

  describe('hijriToGregorian', () => {
    it('1 Muharrem 1445 → Miladi dönüşüm ≈ 18-19 Temmuz 2023', () => {
      const hijri: HijriDate = { day: 1, month: 1, monthName: 'Muharrem', year: 1445 };
      const result = hijriToGregorian(hijri);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(6); // Temmuz
      expect(result.getDate()).toBeGreaterThanOrEqual(17);
      expect(result.getDate()).toBeLessThanOrEqual(20);
    });

    it('1 Ramazan 1445 → Miladi dönüşüm ≈ 11-12 Mart 2024', () => {
      const hijri: HijriDate = { day: 1, month: 9, monthName: 'Ramazan', year: 1445 };
      const result = hijriToGregorian(hijri);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // Mart
      expect(result.getDate()).toBeGreaterThanOrEqual(10);
      expect(result.getDate()).toBeLessThanOrEqual(13);
    });

    it('Hicri ay başlangıcı (gün=1)', () => {
      const hijri: HijriDate = { day: 1, month: 1, monthName: 'Muharrem', year: 1446 };
      const result = hijriToGregorian(hijri);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBeGreaterThanOrEqual(2024);
    });

    it('Hicri ay sonu (gün=29 veya 30)', () => {
      const hijri29: HijriDate = { day: 29, month: 9, monthName: 'Ramazan', year: 1445 };
      const hijri30: HijriDate = { day: 30, month: 9, monthName: 'Ramazan', year: 1445 };
      const result29 = hijriToGregorian(hijri29);
      const result30 = hijriToGregorian(hijri30);
      expect(result29).toBeInstanceOf(Date);
      expect(result30).toBeInstanceOf(Date);
      expect(result30.getTime()).toBeGreaterThan(result29.getTime());
    });
  });

  describe('formatHijri', () => {
    it('Türkçe locale ile formatlama', () => {
      const hijri: HijriDate = { day: 15, month: 9, monthName: 'Ramazan', year: 1447 };
      const result = formatHijri(hijri, 'tr');
      expect(result).toBe('15 Ramazan 1447');
    });

    it('İngilizce locale ile formatlama', () => {
      const hijri: HijriDate = { day: 15, month: 9, monthName: 'Ramazan', year: 1447 };
      const result = formatHijri(hijri, 'en');
      expect(result).toBe('15 Ramadan 1447');
    });

    it('Muharrem ayı TR/EN', () => {
      const hijri: HijriDate = { day: 1, month: 1, monthName: 'Muharrem', year: 1446 };
      expect(formatHijri(hijri, 'tr')).toBe('1 Muharrem 1446');
      expect(formatHijri(hijri, 'en')).toBe('1 Muharram 1446');
    });

    it('tr-TR gibi uzun locale kodlarını desteklemeli', () => {
      const hijri: HijriDate = { day: 10, month: 12, monthName: 'Zilhicce', year: 1445 };
      const result = formatHijri(hijri, 'tr-TR');
      expect(result).toBe('10 Zilhicce 1445');
    });

    it('bilinmeyen locale İngilizce döndürmeli', () => {
      const hijri: HijriDate = { day: 5, month: 7, monthName: 'Recep', year: 1446 };
      const result = formatHijri(hijri, 'de');
      expect(result).toBe('5 Rajab 1446');
    });
  });

  describe('round-trip dönüşüm', () => {
    it('Miladi → Hicri → Miladi round-trip (±1 gün tolerans)', () => {
      const testDates = [
        new Date(2024, 0, 1),
        new Date(2024, 5, 15),
        new Date(2024, 11, 31),
        new Date(2000, 0, 1),
        new Date(2025, 6, 4),
      ];

      for (const original of testDates) {
        const hijri = gregorianToHijri(original);
        const roundTrip = hijriToGregorian(hijri);
        const diffMs = Math.abs(roundTrip.getTime() - original.getTime());
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeLessThanOrEqual(1);
      }
    });

    it('Hicri → Miladi → Hicri round-trip', () => {
      const testHijriDates: HijriDate[] = [
        { day: 1, month: 1, monthName: 'Muharrem', year: 1445 },
        { day: 15, month: 9, monthName: 'Ramazan', year: 1445 },
        { day: 10, month: 12, monthName: 'Zilhicce', year: 1446 },
        { day: 1, month: 1, monthName: 'Muharrem', year: 1400 },
      ];

      for (const original of testHijriDates) {
        const gregorian = hijriToGregorian(original);
        const roundTrip = gregorianToHijri(gregorian);
        expect(roundTrip.year).toBe(original.year);
        expect(roundTrip.month).toBe(original.month);
        expect(Math.abs(roundTrip.day - original.day)).toBeLessThanOrEqual(1);
      }
    });
  });
});
