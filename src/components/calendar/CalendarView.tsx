import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { getReligiousDays } from '../../services/calendarService';
import { gregorianToHijri, formatHijri } from '../../utils/hijriConverter';
import { useSettingsStore } from '../../stores/settingsStore';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return cells;
}

export default function CalendarView() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const religiousDayDates = useMemo(() => {
    const days = getReligiousDays(viewYear);
    const map = new Map<string, string>();
    for (const d of days) {
      map.set(d.gregorianDate, d.type);
    }
    return map;
  }, [viewYear]);

  const todayISO = toISO(today);
  const hijriToday = gregorianToHijri(today);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    language === 'tr' ? 'tr-TR' : 'en-US',
    { month: 'long', year: 'numeric' },
  );

  const DOT_COLORS: Record<string, string> = {
    kandil: 'bg-purple-400',
    bayram: 'bg-emerald-400',
    ozel: 'bg-amber-400',
  };

  function goPrev() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <Card title={t('calendar.title')} icon="📅">
      {/* Hijri date display */}
      <p className="mb-3 text-center text-xs text-gray-500 dark:text-white/45">
        {formatHijri(hijriToday, language)}
      </p>

      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={goPrev}
          aria-label={t('calendar.prevMonth')}
          className="rounded-lg p-1.5 text-gray-600 hover:bg-white/40 dark:text-white/60 dark:hover:bg-white/10 transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-semibold capitalize text-gray-800 dark:text-white/85">
          {monthLabel}
        </span>
        <button
          onClick={goNext}
          aria-label={t('calendar.nextMonth')}
          className="rounded-lg p-1.5 text-gray-600 hover:bg-white/40 dark:text-white/60 dark:hover:bg-white/10 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_KEYS.map((key) => (
          <div
            key={key}
            className="text-center text-[10px] font-semibold uppercase text-gray-400 dark:text-white/35"
          >
            {t(`calendar.day.${key}`)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div
        key={`${viewYear}-${viewMonth}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-7 gap-1"
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const iso = toISO(new Date(viewYear, viewMonth, day));
          const isToday = iso === todayISO;
          const religiousType = religiousDayDates.get(iso);

          return (
            <div
              key={iso}
              className={`
                relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs transition-colors
                ${isToday
                  ? 'bg-indigo-500/20 font-bold text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300'
                  : 'text-gray-700 hover:bg-white/30 dark:text-white/65 dark:hover:bg-white/5'
                }
              `}
            >
              {day}
              {religiousType && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${DOT_COLORS[religiousType] ?? 'bg-indigo-400'}`}
                />
              )}
            </div>
          );
        })}
      </motion.div>
    </Card>
  );
}
