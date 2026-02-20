import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, fetchWithRateLimit, RateLimitError, getRateLimiter } from './apiClient';

// ─── RateLimiter Unit Tests ───

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  it('allows requests within the limit', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      expect(limiter.recordRequest('geolocation', now + i)).toBe(true);
    }
  });

  it('rejects requests exceeding the limit', () => {
    const now = 1000000;
    // geolocation: max 5 per 60s
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now + i);
    }
    expect(limiter.canRequest('geolocation', now + 10)).toBe(false);
    expect(limiter.recordRequest('geolocation', now + 10)).toBe(false);
  });

  it('allows requests after the window expires', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now);
    }
    // 60 seconds later, window has passed
    expect(limiter.canRequest('geolocation', now + 60_001)).toBe(true);
  });

  it('tracks categories independently', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now);
    }
    // geolocation is full, but prayerTimes should still work
    expect(limiter.canRequest('geolocation', now)).toBe(false);
    expect(limiter.canRequest('prayerTimes', now)).toBe(true);
  });

  it('returns correct wait time when rate limited', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now + i * 100);
    }
    // At now + 500, all 5 requests are within the window
    const waitTime = limiter.getWaitTime('geolocation', now + 500);
    // Oldest request is at `now`, it expires at `now + 60000`
    // So wait time = (now + 60000) - (now + 500) = 59500
    expect(waitTime).toBe(59_500);
  });

  it('returns 0 wait time when not rate limited', () => {
    expect(limiter.getWaitTime('geolocation')).toBe(0);
  });

  it('sliding window prunes old timestamps', () => {
    const now = 1000000;
    // Fill up the limit
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now);
    }
    expect(limiter.canRequest('geolocation', now)).toBe(false);

    // After window passes, old timestamps are pruned on next record
    const afterWindow = now + 60_001;
    expect(limiter.recordRequest('geolocation', afterWindow)).toBe(true);
  });

  it('reset clears all tracked timestamps', () => {
    const now = 1000000;
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now);
    }
    expect(limiter.canRequest('geolocation', now)).toBe(false);

    limiter.reset();
    expect(limiter.canRequest('geolocation', now)).toBe(true);
  });

  it('respects different limits per category', () => {
    const now = 1000000;
    // prayerTimes allows 10 requests
    for (let i = 0; i < 10; i++) {
      expect(limiter.recordRequest('prayerTimes', now + i)).toBe(true);
    }
    expect(limiter.canRequest('prayerTimes', now + 10)).toBe(false);
  });
});


// ─── fetchWithRateLimit Unit Tests ───

describe('fetchWithRateLimit', () => {
  beforeEach(() => {
    getRateLimiter().reset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on successful fetch', async () => {
    const mockData = { status: 'OK', data: [1, 2, 3] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }));

    const result = await fetchWithRateLimit<typeof mockData>(
      'https://example.com/api',
      { category: 'prayerTimes', timeoutMs: 5000, maxRetries: 0 },
    );

    expect(result).toEqual(mockData);
  });

  it('throws RateLimitError when rate limit is exceeded', async () => {
    const limiter = getRateLimiter();
    const now = Date.now();
    // Exhaust geolocation limit (5 requests)
    for (let i = 0; i < 5; i++) {
      limiter.recordRequest('geolocation', now);
    }

    await expect(
      fetchWithRateLimit('https://example.com/api', { category: 'geolocation' }),
    ).rejects.toThrow(RateLimitError);
  });

  it('retries on failure and succeeds', async () => {
    const mockData = { result: 'ok' };
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchWithRateLimit<typeof mockData>(
      'https://example.com/api',
      { category: 'prayerTimes', maxRetries: 1, retryDelayMs: 10 },
    );

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting all retries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(
      fetchWithRateLimit('https://example.com/api', {
        category: 'holidays',
        maxRetries: 1,
        retryDelayMs: 10,
      }),
    ).rejects.toThrow('Network error');
  });

  it('throws on non-ok HTTP response after retries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }));

    await expect(
      fetchWithRateLimit('https://example.com/api', {
        category: 'prayerTimes',
        maxRetries: 0,
      }),
    ).rejects.toThrow('HTTP 500');
  });
});
