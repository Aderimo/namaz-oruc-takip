import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { getSahurIftar } from '../../services/prayerService';
import { getRamadanInfo } from '../../services/calendarService';

export default function FastingInfoCard() {
  const { t } = useTranslation();
  const { times, isLoading } = usePrayerTimes();

  if (isLoading) {
    return (
      <Card title={t('fasting.title')} icon="🌙">
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
      <Card title={t('fasting.title')} icon="🌙">
        <p className="py-6 text-center text-sm text-gray-500 dark:text-white/40">
          {t('prayer.noPrayerData')}
        </p>
      </Card>
    );
  }

  const { sahur, iftar } = getSahurIftar(times);
  const ramadan = getRamadanInfo();

  return (
    <Card title={t('fasting.title')} icon="🌙">
      {/* Sahur & İftar vakitleri */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex flex-col items-center rounded-xl bg-indigo-500/10 px-4 py-3 border border-indigo-400/20 dark:bg-indigo-500/15 dark:border-indigo-400/15"
        >
          <span className="text-xs font-medium text-gray-500 dark:text-white/50">
            {t('fasting.sahurTime')}
          </span>
          <span className="mt-1 font-mono text-lg font-semibold text-indigo-700 dark:text-indigo-300">
            {sahur}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex flex-col items-center rounded-xl bg-amber-500/10 px-4 py-3 border border-amber-400/20 dark:bg-amber-500/15 dark:border-amber-400/15"
        >
          <span className="text-xs font-medium text-gray-500 dark:text-white/50">
            {t('fasting.iftarTime')}
          </span>
          <span className="mt-1 font-mono text-lg font-semibold text-amber-700 dark:text-amber-300">
            {iftar}
          </span>
        </motion.div>
      </div>

      {/* Ramazan bilgisi */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mt-4 rounded-xl bg-white/30 px-4 py-3 text-center dark:bg-white/5"
      >
        {ramadan.isRamadan ? (
          <>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {t('fasting.ramadanDay', { day: ramadan.currentDay })}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/50">
              {t('fasting.daysRemaining', { count: ramadan.daysRemaining })}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600 dark:text-white/60">
            {t('fasting.nextRamadan', { count: ramadan.daysRemaining })}
          </p>
        )}
      </motion.div>
    </Card>
  );
}
