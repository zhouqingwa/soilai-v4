import { describe, it, expect, beforeEach } from 'vitest';
import { enforceMemoryLimit, releaseMemoryLimit, msUntilUtcMidnight } from '../memory-limit.js';

let counter = 0;
const uniqueKey = (label: string) => `${label}-${counter++}-${Date.now()}`;

describe('enforceMemoryLimit', () => {
  beforeEach(() => {
    // Each test uses a unique key, so no cross-test pollution
  });

  it('allows requests within the limit', () => {
    const key = uniqueKey('within-limit');
    expect(() => enforceMemoryLimit(key, 5, 60_000, 'Limited')).not.toThrow();
    expect(() => enforceMemoryLimit(key, 5, 60_000, 'Limited')).not.toThrow();
  });

  it('throws when limit is exceeded', () => {
    const key = uniqueKey('exceeded');
    enforceMemoryLimit(key, 2, 60_000, 'Too many');
    enforceMemoryLimit(key, 2, 60_000, 'Too many');
    expect(() => enforceMemoryLimit(key, 2, 60_000, 'Too many')).toThrow('Too many');
  });

  it('uses a sliding window per key', () => {
    const keyA = uniqueKey('alpha');
    const keyB = uniqueKey('beta');
    enforceMemoryLimit(keyA, 1, 60_000, 'Limited');
    expect(() => enforceMemoryLimit(keyA, 1, 60_000, 'Limited')).toThrow('Limited');
    expect(() => enforceMemoryLimit(keyB, 1, 60_000, 'Limited')).not.toThrow();
  });

  it('includes the custom message in the error', () => {
    const key = uniqueKey('custom-msg');
    enforceMemoryLimit(key, 1, 60_000, 'Custom rate limit message');
    expect(() => enforceMemoryLimit(key, 1, 60_000, 'Custom rate limit message')).toThrow('Custom rate limit message');
  });

  it('throws ApiError with 429 status', () => {
    const key = uniqueKey('status-429');
    enforceMemoryLimit(key, 1, 60_000, 'Limited');
    try {
      enforceMemoryLimit(key, 1, 60_000, 'Limited');
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e.statusCode).toBe(429);
      expect(e.code).toBe('rate_limited');
    }
  });
});

describe('releaseMemoryLimit', () => {
  beforeEach(() => {
    // releaseMemoryLimit can still leak if key exists, so use unique keys
  });

  it('decrements the counter so more requests are allowed', () => {
    const key = uniqueKey('decrement');
    enforceMemoryLimit(key, 1, 60_000, 'Limited');
    expect(() => enforceMemoryLimit(key, 1, 60_000, 'Limited')).toThrow('Limited');

    releaseMemoryLimit(key);
    expect(() => enforceMemoryLimit(key, 1, 60_000, 'Limited')).not.toThrow();
  });

  it('is a no-op for unknown keys', () => {
    expect(() => releaseMemoryLimit('nonexistent-' + Date.now())).not.toThrow();
  });

  it('can release multiple times', () => {
    const key = uniqueKey('multi-release');
    enforceMemoryLimit(key, 3, 60_000, 'Limited');
    enforceMemoryLimit(key, 3, 60_000, 'Limited');
    enforceMemoryLimit(key, 3, 60_000, 'Limited');
    expect(() => enforceMemoryLimit(key, 3, 60_000, 'Limited')).toThrow('Limited');

    releaseMemoryLimit(key);
    expect(() => enforceMemoryLimit(key, 3, 60_000, 'Limited')).not.toThrow();
  });
});

describe('msUntilUtcMidnight', () => {
  it('returns a positive number', () => {
    expect(msUntilUtcMidnight()).toBeGreaterThan(0);
  });

  it('returns at most 24 hours in milliseconds', () => {
    expect(msUntilUtcMidnight()).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it('returns at least 60 seconds (floor)', () => {
    expect(msUntilUtcMidnight()).toBeGreaterThanOrEqual(60_000);
  });
});
