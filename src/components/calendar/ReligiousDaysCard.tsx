import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { getUpcomingReligiousDays } from '../../services/calendarService';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ReligiousDay } from '../../types';

const TYPE_STYLES: Record<ReligiousDay['type'], string> = {
  kandil: 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  bayram: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  ozel: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
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

export default function ReligiousDaysCard() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const days = getUpcomingReligiousDays(5);

  return (
    <Card title={t('calendar.religiousDays')} icon="🕌">
      {days.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-white/40">
          {t('calendar.noReligiousDays')}
        </p>
      ) : (
        <ul className="space-y-2">
          {days.map((day, i) => {
            const remaining = getDaysRemaining(day.gregorianDate);
            const name = language === 'tr' ? day.name : day.nameEn;

            return (
              <motion.li
                key={day.gregorianDate + day.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-white/85">
                    {name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/45">
                    {formatDate(day.gregorianDate, language)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_STYLES[day.type]}`}
                  >
                    {t(`calendar.type.${day.type}`)}
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
