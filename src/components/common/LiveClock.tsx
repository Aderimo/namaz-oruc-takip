import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LiveClock() {
  const { t } = useTranslation();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-white/10 border border-white/10">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
        {t('time.currentTime')}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-white/80">
        {hh}:{mm}:{ss}
      </span>
    </div>
  );
}
