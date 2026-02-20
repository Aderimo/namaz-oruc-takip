import type { CacheEntry } from '../types';

const CACHE_PREFIX = 'nt_';

function prefixKey(key: string): string {
  return key.startsWith(CACHE_PREFIX) ? key : `${CACHE_PREFIX}${key}`;
}

export function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(prefixKey(key));
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(prefixKey(key));
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function set<T>(key: string, data: T, ttlMs: number): void {
  try {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    };
    localStorage.setItem(prefixKey(key), JSON.stringify(entry));
  } catch {
    // localStorage dolu veya erişilemez — sessizce geç
  }
}

export function isValid(key: string): boolean {
  try {
    const raw = localStorage.getItem(prefixKey(key));
    if (!raw) return false;

    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() <= entry.expiresAt;
  } catch {
    return false;
  }
}

export function clear(key: string): void {
  try {
    localStorage.removeItem(prefixKey(key));
  } catch {
    // sessizce geç
  }
}

export function clearAll(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // sessizce geç
  }
}
