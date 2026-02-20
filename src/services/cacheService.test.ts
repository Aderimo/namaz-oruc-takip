import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as cache from './cacheService';

beforeEach(() => {
  localStorage.clear();
});

describe('cacheService', () => {
  describe('set & get round-trip', () => {
    it('stores and retrieves data within TTL', () => {
      cache.set('test', { foo: 'bar' }, 60_000);
      expect(cache.get('test')).toEqual({ foo: 'bar' });
    });

    it('returns null for expired entries', () => {
      vi.useFakeTimers();
      cache.set('test', 'value', 1_000);
      vi.advanceTimersByTime(1_001);
      expect(cache.get('test')).toBeNull();
      vi.useRealTimers();
    });

    it('returns null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });
  });

  describe('isValid', () => {
    it('returns true for valid (non-expired) entry', () => {
      cache.set('valid', 123, 60_000);
      expect(cache.isValid('valid')).toBe(true);
    });

    it('returns false for expired entry', () => {
      vi.useFakeTimers();
      cache.set('expired', 123, 500);
      vi.advanceTimersByTime(501);
      expect(cache.isValid('expired')).toBe(false);
      vi.useRealTimers();
    });

    it('returns false for missing key', () => {
      expect(cache.isValid('missing')).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes a specific cache entry', () => {
      cache.set('a', 1, 60_000);
      cache.set('b', 2, 60_000);
      cache.clear('a');
      expect(cache.get('a')).toBeNull();
      expect(cache.get('b')).toBe(2);
    });
  });

  describe('clearAll', () => {
    it('removes all entries with nt_ prefix', () => {
      cache.set('x', 1, 60_000);
      cache.set('y', 2, 60_000);
      localStorage.setItem('other_key', 'keep');
      cache.clearAll();
      expect(cache.get('x')).toBeNull();
      expect(cache.get('y')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('keep');
    });
  });

  describe('prefix handling', () => {
    it('applies nt_ prefix to keys', () => {
      cache.set('location', 'istanbul', 60_000);
      expect(localStorage.getItem('nt_location')).toBeTruthy();
    });

    it('does not double-prefix keys that already have nt_', () => {
      cache.set('nt_location', 'istanbul', 60_000);
      expect(localStorage.getItem('nt_location')).toBeTruthy();
      expect(localStorage.getItem('nt_nt_location')).toBeNull();
    });
  });

  describe('localStorage error handling', () => {
    it('returns null from get when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(cache.get('test')).toBeNull();
      vi.restoreAllMocks();
    });

    it('does not throw from set when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() => cache.set('test', 'val', 1000)).not.toThrow();
      vi.restoreAllMocks();
    });

    it('returns false from isValid when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('access denied');
      });
      expect(cache.isValid('test')).toBe(false);
      vi.restoreAllMocks();
    });
  });
});
