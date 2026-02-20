import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { getHolidays, getUpcomingHolidays } from '../../services/holidayService';
import { useLocationStore } from '../../stores/locationStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Holiday } from '../../types';

const TYPE_STYLES: Record<Holiday['type'], string> = {
  national: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  religious: 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  public: 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
};

function getDaysRemaining(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
  });
}

export default function HolidayCard() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const location = useLocationStore((s) => s.location);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const countryCode = location?.countryCode ?? 'TR';
  const year = new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getHolidays(countryCode, year)
      .then((all) => {
        if (!cancelled) {
          setHolidays(getUpcomingHolidays(all, 5));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [countryCode, year]);

  if (isLoading) {
    return (
      <Card title={t('calendar.holidays')} icon="🎉">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500 dark:text-white/50">
            {t('ui.label.loading')}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card title={t('calendar.holidays')} icon="🎉">
      {holidays.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-white/40">
          {t('calendar.noHolidays')}
        </p>
      ) : (
        <ul className="space-y-2">
          {holidays.map((holiday, i) => {
            const remaining = getDaysRemaining(holiday.date);

            return (
              <motion.li
                key={holiday.date + holiday.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-white/85">
                    {language === 'en' && holiday.nameEn ? holiday.nameEn : holiday.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/45">
                    {formatDate(holiday.date, language)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_STYLES[holiday.type]}`}
                  >
                    {t(`calendar.type.${holiday.type}`)}
                  </span>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {remaining === 0
                      ? t('calendar.today')
                      : t('calendar.daysLeft', { count: remaining })}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
