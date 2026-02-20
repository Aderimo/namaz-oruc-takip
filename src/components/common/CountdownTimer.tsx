import { useTranslation } from 'react-i18next';
import AnimatedNumber from './AnimatedNumber';

interface CountdownTimerProps {
  hours: number;
  minutes: number;
  seconds: number;
  label?: string;
}

export default function CountdownTimer({ hours, minutes, seconds, label }: CountdownTimerProps) {
  const { t } = useTranslation();

  const segments = [
    { value: hours, unit: t('time.hours') },
    { value: minutes, unit: t('time.minutes') },
    { value: seconds, unit: t('time.seconds') },
  ];

  return (
    <div role="timer" aria-label={label} className="flex flex-col items-center gap-2">
      {/* Kırmızı GERİ SAYIM badge */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400 animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        {t('time.countdown')}
      </span>

      {label && (
        <span className="text-sm font-medium text-indigo-300/80 dark:text-indigo-300/70">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        {segments.map((seg, i) => (
          <div key={seg.unit} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className="
                  min-w-[3.5rem] rounded-xl px-3 py-2 text-center
                  bg-indigo-950/40 border border-indigo-400/20 shadow-inner
                  dark:bg-indigo-950/60 dark:border-indigo-400/15
                "
              >
                <AnimatedNumber
                  value={seg.value}
                  className="text-3xl font-bold tabular-nums text-white"
                />
              </div>
              <span className="mt-1 text-[0.65rem] uppercase tracking-wider text-indigo-300/60 dark:text-indigo-300/50">
                {seg.unit}
              </span>
            </div>
            {i < segments.length - 1 && (
              <span className="mb-4 text-2xl font-light text-indigo-300/40" aria-hidden="true">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
