// API İstemcisi - Rate limiting, timeout, retry desteği
// Gereksinim 6.4: API isteklerinde hız sınırlaması koruması

export type ApiCategory = 'geolocation' | 'prayerTimes' | 'holidays';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<ApiCategory, RateLimitConfig> = {
  geolocation: { maxRequests: 5, windowMs: 60_000 },
  prayerTimes: { maxRequests: 10, windowMs: 60_000 },
  holidays: { maxRequests: 5, windowMs: 60_000 },
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

/**
 * Sliding window rate limiter.
 * Tracks request timestamps per API category and rejects requests that exceed the limit.
 */
export class RateLimiter {
  #timestamps: Map<ApiCategory, number[]> = new Map();
  #limits: Record<ApiCategory, RateLimitConfig>;

  constructor(limits: Record<ApiCategory, RateLimitConfig> = RATE_LIMITS) {
    this.#limits = limits;
  }

  /**
   * Checks if a request can be made for the given category without exceeding the rate limit.
   */
  canRequest(category: ApiCategory, now: number = Date.now()): boolean {
    const config = this.#limits[category];
    if (!config) return true;

    const times = this.#getTimestamps(category);
    const windowStart = now - config.windowMs;
    const recentRequests = times.filter((t) => t > windowStart);

    return recentRequests.length < config.maxRequests;
  }

  /**
   * Records a request timestamp for the given category.
   * Returns true if the request was allowed, false if rate limited.
   */
  recordRequest(category: ApiCategory, now: number = Date.now()): boolean {
    if (!this.canRequest(category, now)) {
      return false;
    }

    const config = this.#limits[category];
    const times = this.#getTimestamps(category);
    const windowStart = now - config.windowMs;

    // Prune old timestamps outside the window
    const pruned = times.filter((t) => t > windowStart);
    pruned.push(now);
    this.#timestamps.set(category, pruned);

    return true;
  }

  /**
   * Returns the time in ms until the next request can be made.
   * Returns 0 if a request can be made immediately.
   */
  getWaitTime(category: ApiCategory, now: number = Date.now()): number {
    if (this.canRequest(category, now)) return 0;

    const config = this.#limits[category];
    const times = this.#getTimestamps(category);
    const windowStart = now - config.windowMs;
    const recentRequests = times.filter((t) => t > windowStart);

    if (recentRequests.length === 0) return 0;

    // Oldest request in window — when it expires, a slot opens
    const oldest = Math.min(...recentRequests);
    return oldest + config.windowMs - now;
  }

  /**
   * Resets all tracked timestamps (useful for testing).
   */
  reset(): void {
    this.#timestamps.clear();
  }

  #getTimestamps(category: ApiCategory): number[] {
    return this.#timestamps.get(category) ?? [];
  }
}


// Singleton rate limiter instance
const rateLimiter = new RateLimiter();

export interface FetchOptions {
  category: ApiCategory;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class RateLimitError extends Error {
  public readonly waitTimeMs: number;

  constructor(category: ApiCategory, waitTimeMs: number) {
    super(`Rate limit exceeded for "${category}". Retry after ${Math.ceil(waitTimeMs / 1000)}s.`);
    this.name = 'RateLimitError';
    this.waitTimeMs = waitTimeMs;
  }
}

/**
 * Creates an AbortController-based timeout for fetch requests.
 */
function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Delays execution for the given number of milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main fetch wrapper with rate limiting, timeout, and retry support.
 * Throws RateLimitError if the rate limit is exceeded.
 */
export async function fetchWithRateLimit<T>(
  url: string,
  options: FetchOptions,
  init: RequestInit = {},
): Promise<T> {
  const {
    category,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = RETRY_DELAY_MS,
  } = options;

  // Check rate limit before making the request
  const now = Date.now();
  if (!rateLimiter.canRequest(category, now)) {
    const waitTime = rateLimiter.getWaitTime(category, now);
    throw new RateLimitError(category, waitTime);
  }

  // Record the request
  rateLimiter.recordRequest(category, now);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, init, timeoutMs);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort (timeout) for the last attempt
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt) break;

      await delay(retryDelayMs * (attempt + 1)); // Linear backoff
    }
  }

  throw lastError!;
}

/**
 * Returns the singleton RateLimiter instance (for testing or external access).
 */
export function getRateLimiter(): RateLimiter {
  return rateLimiter;
}
