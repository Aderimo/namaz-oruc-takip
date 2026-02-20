import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

/**
 * Hedef zamana geri sayım hook'u.
 * @param targetTime - "HH:mm" formatında hedef saat
 * @param dateStr - Opsiyonel tarih string'i (YYYY-MM-DD). Verilmezse bugünü kullanır.
 * @returns Kalan saat, dakika, saniye ve toplam milisaniye
 */
export function useCountdown(targetTime: string, dateStr?: string): CountdownResult {
  const calcRemaining = useCallback((): number => {
    if (!targetTime) return 0;

    const now = new Date();
    const dateBase = dateStr ?? now.toISOString().slice(0, 10);
    const target = new Date(`${dateBase}T${targetTime}:00`);
    const diff = target.getTime() - now.getTime();

    return diff > 0 ? diff : 0;
  }, [targetTime, dateStr]);

  const [totalMs, setTotalMs] = useState<number>(calcRemaining);

  useEffect(() => {
    // İlk değeri hemen hesapla
    setTotalMs(calcRemaining());

    const interval = setInterval(() => {
      setTotalMs(calcRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [calcRemaining]);

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, totalMs };
}
