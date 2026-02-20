import { describe, it, expect } from 'vitest';
import {
  getReligiousDays,
  getUpcomingReligiousDays,
  getRamadanInfo,
} from './calendarService';

describe('calendarService', () => {
  describe('getReligiousDays', () => {
    it('belirli bir yıl için dini günleri döndürür', () => {
      const days = getReligiousDays(2025);
      expect(days.length).toBeGreaterThan(0);
    });

    it('her dini gün gerekli alanlara sahip olmalı', () => {
      const days = getReligiousDays(2025);
      for (const day of days) {
        expect(day.name).toBeTruthy();
        expect(day.nameEn).toBeTruthy();
        expect(day.hijriDate).toBeDefined();
        expect(day.hijriDate.day).toBeGreaterThan(0);
        expect(day.hijriDate.month).toBeGreaterThanOrEqual(1);
        expect(day.hijriDate.month).toBeLessThanOrEqual(12);
        expect(day.hijriDate.year).toBeGreaterThan(0);
        expect(day.gregorianDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(['kandil', 'bayram', 'ozel']).toContain(day.type);
      }
    });

    it('sonuçlar tarihe göre artan sırada olmalı', () => {
      const days = getReligiousDays(2025);
      for (let i = 1; i < days.length; i++) {
        expect(days[i]!.gregorianDate >= days[i - 1]!.gregorianDate).toBe(true);
      }
    });

    it('tüm dini günlerin Miladi tarihi istenen yıl içinde olmalı', () => {
      const year = 2025;
      const days = getReligiousDays(year);
      for (const day of days) {
        expect(day.gregorianDate.startsWith(String(year))).toBe(true);
      }
    });

    it('kandil gecelerini içermeli', () => {
      const days = getReligiousDays(2025);
      const kandiller = days.filter((d) => d.type === 'kandil');
      expect(kandiller.length).toBeGreaterThanOrEqual(1);
    });

    it('bayramları içermeli', () => {
      const days = getReligiousDays(2025);
      const bayramlar = days.filter((d) => d.type === 'bayram');
      expect(bayramlar.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getUpcomingReligiousDays', () => {
    it('belirtilen sayıda yaklaşan dini gün döndürür', () => {
      const ref = new Date(2025, 0, 1); // 1 Ocak 2025
      const upcoming = getUpcomingReligiousDays(3, ref);
      expect(upcoming.length).toBeLessThanOrEqual(3);
      expect(upcoming.length).toBeGreaterThan(0);
    });

    it('tüm sonuçlar referans tarihinden sonra olmalı', () => {
      const ref = new Date(2025, 5, 15); // 15 Haziran 2025
      const refISO = '2025-06-15';
      const upcoming = getUpcomingReligiousDays(5, ref);
      for (const day of upcoming) {
        expect(day.gregorianDate > refISO).toBe(true);
      }
    });

    it('sonuçlar tarihe göre artan sırada olmalı', () => {
      const ref = new Date(2025, 0, 1);
      const upcoming = getUpcomingReligiousDays(10, ref);
      for (let i = 1; i < upcoming.length; i++) {
        expect(upcoming[i]!.gregorianDate >= upcoming[i - 1]!.gregorianDate).toBe(true);
      }
    });

    it('referenceDate verilmezse bugünü kullanmalı', () => {
      const upcoming = getUpcomingReligiousDays(3);
      expect(upcoming.length).toBeGreaterThanOrEqual(0);
      // Tüm sonuçlar bugünden sonra olmalı
      const todayISO = new Date().toISOString().slice(0, 10);
      for (const day of upcoming) {
        expect(day.gregorianDate > todayISO).toBe(true);
      }
    });

    it('count 0 ise boş dizi döndürmeli', () => {
      const upcoming = getUpcomingReligiousDays(0, new Date(2025, 0, 1));
      expect(upcoming).toEqual([]);
    });
  });

  describe('getRamadanInfo', () => {
    it('Ramazan bilgilerini döndürür', () => {
      const info = getRamadanInfo(2025);
      expect(info).toHaveProperty('start');
      expect(info).toHaveProperty('end');
      expect(info).toHaveProperty('currentDay');
      expect(info).toHaveProperty('isRamadan');
      expect(info).toHaveProperty('daysRemaining');
      expect(info.start instanceof Date).toBe(true);
      expect(info.end instanceof Date).toBe(true);
    });

    it('start end\'den önce olmalı', () => {
      const info = getRamadanInfo(2025);
      expect(info.start.getTime()).toBeLessThan(info.end.getTime());
    });

    it('Ramazan dışında currentDay null olmalı', () => {
      // 1 Ocak 2025 — Ramazan dışında
      const info = getRamadanInfo(2025);
      // 2025 yılının 1 Ocak'ı Ramazan dışında olmalı
      if (!info.isRamadan) {
        expect(info.currentDay).toBeNull();
        expect(info.daysRemaining).toBeGreaterThan(0);
      }
    });

    it('daysRemaining pozitif olmalı (Ramazan dışında)', () => {
      const info = getRamadanInfo(2025);
      if (!info.isRamadan) {
        expect(info.daysRemaining).toBeGreaterThan(0);
      }
    });

    it('year parametresi verilmezse bugünü kullanmalı', () => {
      const info = getRamadanInfo();
      expect(info).toHaveProperty('isRamadan');
      expect(typeof info.isRamadan).toBe('boolean');
    });
  });
});
