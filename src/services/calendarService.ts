import type { HijriDate, ReligiousDay } from '../types';
import { gregorianToHijri, hijriToGregorian } from '../utils/hijriConverter';
import religiousDaysData from '../data/religiousDays.json';

interface ReligiousDayTemplate {
  name: string;
  nameEn: string;
  hijriMonth: number;
  hijriDay: number;
  type: 'kandil' | 'bayram' | 'ozel';
  description?: string;
}

/**
 * Verilen Miladi yıl için tüm dini günleri hesaplar.
 * Hicri takvim Miladi takvimden ~11 gün kısa olduğundan,
 * bir Miladi yıl içinde birden fazla Hicri yıl olabilir.
 */
export function getReligiousDays(year: number): ReligiousDay[] {
  const templates = religiousDaysData as ReligiousDayTemplate[];
  const results: ReligiousDay[] = [];

  // Yılın başı ve sonundaki Hicri yılları bul
  const hijriStart = gregorianToHijri(new Date(year, 0, 1));
  const hijriEnd = gregorianToHijri(new Date(year, 11, 31));

  // Bu aralıktaki tüm Hicri yılları tara
  for (let hYear = hijriStart.year; hYear <= hijriEnd.year; hYear++) {
    for (const template of templates) {
      const hijriDate: HijriDate = {
        day: template.hijriDay,
        month: template.hijriMonth,
        monthName: '',
        year: hYear,
      };

      const gregDate = hijriToGregorian(hijriDate);

      // Sadece istenen Miladi yıl içindeki tarihleri al
      if (gregDate.getFullYear() !== year) continue;

      const isoDate = formatISO(gregDate);

      results.push({
        name: template.name,
        nameEn: template.nameEn,
        hijriDate: {
          ...hijriDate,
          monthName: gregorianToHijri(gregDate).monthName,
        },
        gregorianDate: isoDate,
        type: template.type,
        description: template.description,
      });
    }
  }

  // Tarihe göre sırala
  results.sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate));
  return results;
}

/**
 * Yaklaşan dini günleri referans tarihten sonra, tarihe göre artan sırada döndürür.
 */
export function getUpcomingReligiousDays(
  count: number,
  referenceDate?: Date,
): ReligiousDay[] {
  const ref = referenceDate ?? new Date();
  const refISO = formatISO(ref);

  // Mevcut yıl ve sonraki yılın dini günlerini al
  const currentYear = ref.getFullYear();
  const days = [
    ...getReligiousDays(currentYear),
    ...getReligiousDays(currentYear + 1),
  ];

  // Referans tarihinden sonraki günleri filtrele ve sırala
  const upcoming = days
    .filter((d) => d.gregorianDate > refISO)
    .sort((a, b) => a.gregorianDate.localeCompare(b.gregorianDate));

  return upcoming.slice(0, count);
}

/**
 * Ramazan bilgilerini döndürür.
 * - Ramazan içindeyse: currentDay (1-30), daysRemaining (30 - currentDay)
 * - Ramazan dışındaysa: currentDay null, daysRemaining = sonraki Ramazan'a kalan gün
 */
export function getRamadanInfo(year?: number): {
  start: Date;
  end: Date;
  currentDay: number | null;
  isRamadan: boolean;
  daysRemaining: number;
} {
  const now = year != null ? new Date(year, 0, 1) : new Date();
  const hijriNow = gregorianToHijri(now);

  // Mevcut veya hedef Hicri yıl için Ramazan başlangıç/bitiş
  let ramadanHijriYear = hijriNow.year;

  // Ramazan başlangıcı: 1 Ramazan (ay 9)
  const ramadanStart = hijriToGregorian({
    day: 1,
    month: 9,
    monthName: 'Ramazan',
    year: ramadanHijriYear,
  });

  // Ramazan bitişi: 1 Şevval (ay 10) — bayramın ilk günü
  const ramadanEnd = hijriToGregorian({
    day: 1,
    month: 10,
    monthName: 'Şevval',
    year: ramadanHijriYear,
  });

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ramStart = new Date(
    ramadanStart.getFullYear(),
    ramadanStart.getMonth(),
    ramadanStart.getDate(),
  );
  const ramEnd = new Date(
    ramadanEnd.getFullYear(),
    ramadanEnd.getMonth(),
    ramadanEnd.getDate(),
  );

  const isRamadan = todayStart >= ramStart && todayStart < ramEnd;

  if (isRamadan) {
    const diffMs = todayStart.getTime() - ramStart.getTime();
    const currentDay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const daysRemaining = 30 - currentDay;

    return {
      start: ramadanStart,
      end: ramadanEnd,
      currentDay,
      isRamadan: true,
      daysRemaining,
    };
  }

  // Ramazan dışında — sonraki Ramazan'ı bul
  let nextRamadanStart: Date;
  if (todayStart >= ramEnd) {
    // Bu yılın Ramazanı geçmiş, sonraki Hicri yılın Ramazanı
    nextRamadanStart = hijriToGregorian({
      day: 1,
      month: 9,
      monthName: 'Ramazan',
      year: ramadanHijriYear + 1,
    });
  } else {
    // Ramazan henüz gelmemiş
    nextRamadanStart = ramadanStart;
  }

  const nextStart = new Date(
    nextRamadanStart.getFullYear(),
    nextRamadanStart.getMonth(),
    nextRamadanStart.getDate(),
  );
  const diffMs = nextStart.getTime() - todayStart.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    start: nextRamadanStart,
    end: hijriToGregorian({
      day: 1,
      month: 10,
      monthName: 'Şevval',
      year: todayStart >= ramEnd ? ramadanHijriYear + 1 : ramadanHijriYear,
    }),
    currentDay: null,
    isRamadan: false,
    daysRemaining,
  };
}

/**
 * Date nesnesini YYYY-MM-DD ISO formatına dönüştürür.
 */
function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
