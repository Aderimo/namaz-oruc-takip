import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import CountdownTimer from '../common/CountdownTimer';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';
import { getSahurIftar } from '../../services/prayerService';
import { useCountdown } from '../../hooks/useCountdown';

/**
 * Mevcut saate göre iftar mı sahur mu geri sayımı gösterileceğini belirler.
 * Mantık: Akşam (maghrib) vaktinden önce → iftar geri sayımı
 *         Akşam vaktinden sonra → sahur geri sayımı (ertesi gün)
 */
function useTargetInfo(iftarTime: string, sahurTime: string, dateStr?: string) {
  return useMemo(() => {
    if (!iftarTime || !sahurTime) return null;

    const now = new Date();
    const base = dateStr ?? now.toISOString().slice(0, 10);
    const iftarDate = new Date(`${base}T${iftarTime}:00`);

    const isBeforeIftar = now.getTime() < iftarDate.getTime();

    if (isBeforeIftar) {
      return { target: iftarTime, type: 'iftar' as const, dateStr: base };
    }

    // İftar geçmiş — ertesi günün sahur vaktine geri sayım
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    return { target: sahurTime, type: 'sahur' as const, dateStr: tomorrowStr };
  }, [iftarTime, sahurTime, dateStr]);
}

export default function FastingCountdown() {
  const { t } = useTranslation();
  const { times } = usePrayerTimes();

  const sahurIftar = times ? getSahurIftar(times) : null;
  const targetInfo = useTargetInfo(
    sahurIftar?.iftar ?? '',
    sahurIftar?.sahur ?? '',
    times?.date,
  );

  const { hours, minutes, seconds } = useCountdown(
    targetInfo?.target ?? '',
    targetInfo?.dateStr,
  );

  if (!times || !targetInfo) {
    return (
      <Card title={t('fasting.iftarCountdown')} icon="🍽️">
        <p className="py-6 text-center text-sm text-gray-500 dark:text-white/40">
          {t('prayer.noPrayerData')}
        </p>
      </Card>
    );
  }

  const isIftar = targetInfo.type === 'iftar';
  const label = isIftar ? t('fasting.iftarCountdown') : t('fasting.sahurCountdown');
  const timeStr = isIftar ? sahurIftar!.iftar : sahurIftar!.sahur;

  return (
    <Card title={label} icon="🍽️">
      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-sm text-gray-500 dark:text-white/50">
          {isIftar ? t('fasting.iftarTime') : t('fasting.sahurTime')}: {timeStr}
        </span>

        <CountdownTimer
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          label={label}
        />
      </div>
    </Card>
  );
}
