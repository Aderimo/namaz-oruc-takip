import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hedef zaman gelecekte olduğunda kalan süreyi döndürür', () => {
    // Şu an 10:00, hedef 12:30 → 2 saat 30 dakika kaldı
    vi.setSystemTime(new Date('2025-01-15T10:00:00'));

    const { result } = renderHook(() => useCountdown('12:30', '2025-01-15'));

    expect(result.current.hours).toBe(2);
    expect(result.current.minutes).toBe(30);
    expect(result.current.seconds).toBe(0);
    expect(result.current.totalMs).toBe(2 * 60 * 60 * 1000 + 30 * 60 * 1000);
  });

  it('hedef zaman geçmişse sıfır döndürür', () => {
    vi.setSystemTime(new Date('2025-01-15T14:00:00'));

    const { result } = renderHook(() => useCountdown('12:00', '2025-01-15'));

    expect(result.current.hours).toBe(0);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
    expect(result.current.totalMs).toBe(0);
  });

  it('her saniye güncellenir', () => {
    vi.setSystemTime(new Date('2025-01-15T10:00:00'));

    const { result } = renderHook(() => useCountdown('10:01', '2025-01-15'));

    expect(result.current.seconds).toBe(0);
    expect(result.current.minutes).toBe(1);

    // 30 saniye ilerlet
    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.seconds).toBe(30);
    expect(result.current.minutes).toBe(0);
  });

  it('boş targetTime verildiğinde sıfır döndürür', () => {
    vi.setSystemTime(new Date('2025-01-15T10:00:00'));

    const { result } = renderHook(() => useCountdown(''));

    expect(result.current.totalMs).toBe(0);
  });

  it('dateStr verilmezse bugünü kullanır', () => {
    vi.setSystemTime(new Date('2025-01-15T10:00:00'));

    const { result } = renderHook(() => useCountdown('11:00'));

    expect(result.current.hours).toBe(1);
    expect(result.current.minutes).toBe(0);
    expect(result.current.totalMs).toBe(60 * 60 * 1000);
  });
});
