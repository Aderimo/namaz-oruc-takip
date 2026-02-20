import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import type { PrayerTimes } from '../../types';

const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

type PrayerKey = (typeof PRAYER_KEYS)[number];

function getPrayerTime(times: PrayerTimes, key: PrayerKey): string {
  return times[key];
}

function isActivePrayer(nextPrayerName: string | undefined, key: PrayerKey): boolean {
  if (!nextPrayerName) return false;
  return nextPrayerName.toLowerCase() === key;
}

export default function PrayerTimesCard() {
  const { t } = useTranslation();
  const { times, nextPrayer, isLoading } = usePrayerTimes();

  if (isLoading) {
    return (
      <Card title={t('prayer.title')} icon="🕌">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500 dark:text-white/50">
            {t('ui.label.loading')}
          </span>
        </div>
      </Card>
    );
  }

  if (!times) {
    return (
      <Card title={t('prayer.title')} icon="🕌">
        <p className="py-6 text-center text-sm text-gray-500 dark:text-white/40">
          {t('prayer.noPrayerData')}
        </p>
      </Card>
    );
  }

  return (
    <Card title={t('prayer.title')} icon="🕌">
      <ul className="space-y-1">
        {PRAYER_KEYS.map((key, i) => {
          const active = isActivePrayer(nextPrayer?.name, key);

          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`
                flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors
                ${active
                  ? 'bg-indigo-500/15 border border-indigo-400/30 dark:bg-indigo-500/20 dark:border-indigo-400/25'
                  : 'hover:bg-white/40 dark:hover:bg-white/5'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {active && (
                  <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]" />
                )}
                <span
                  className={`text-sm font-medium ${
                    active
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-white/70'
                  }`}
                >
                  {t(`prayer.${key}`)}
                </span>
              </div>
              <span
                className={`font-mono text-sm tabular-nums ${
                  active
                    ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-white/60'
                }`}
              >
                {getPrayerTime(times, key)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}
