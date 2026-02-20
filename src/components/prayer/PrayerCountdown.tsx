import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import CountdownTimer from '../common/CountdownTimer';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { useCountdown } from '../../hooks/useCountdown';

const PRAYER_KEY_MAP: Record<string, string> = {
  fajr: 'prayer.fajr',
  sunrise: 'prayer.sunrise',
  dhuhr: 'prayer.dhuhr',
  asr: 'prayer.asr',
  maghrib: 'prayer.maghrib',
  isha: 'prayer.isha',
};

export default function PrayerCountdown() {
  const { t } = useTranslation();
  const { nextPrayer, times } = usePrayerTimes();
  const { hours, minutes, seconds } = useCountdown(
    nextPrayer?.time ?? '',
    times?.date,
  );

  if (!nextPrayer) {
    return (
      <Card title={t('prayer.nextPrayer')} icon="⏳">
        <p className="py-6 text-center text-sm text-gray-500 dark:text-white/40">
          {t('prayer.noPrayerData')}
        </p>
      </Card>
    );
  }

  const prayerNameKey = PRAYER_KEY_MAP[nextPrayer.name.toLowerCase()] ?? nextPrayer.name;
  const translatedName = prayerNameKey.startsWith('prayer.') ? t(prayerNameKey) : nextPrayer.name;

  return (
    <Card title={t('prayer.nextPrayer')} icon="⏳">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
            {translatedName}
          </span>
          <span className="ml-2 font-mono text-sm text-gray-500 dark:text-white/50">
            {nextPrayer.time}
          </span>
        </div>

        <CountdownTimer
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          label={t('prayer.timeRemaining')}
        />
      </div>
    </Card>
  );
}
