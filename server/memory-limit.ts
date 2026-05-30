import { ApiError } from './http.js';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const now = () => Date.now();

const cleanupExpiredBuckets = () => {
  const current = now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= current) {
      buckets.delete(key);
    }
  }
};

export const msUntilUtcMidnight = () => {
  const current = new Date();
  const next = new Date(current);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(60_000, next.getTime() - current.getTime());
};

export const enforceMemoryLimit = (key: string, max: number, windowMs: number, message: string) => {
  cleanupExpiredBuckets();

  const current = now();
  const existing = buckets.get(key);
  const bucket = existing && existing.resetAt > current
    ? existing
    : { count: 0, resetAt: current + windowMs };

  if (bucket.count >= max) {
    throw new ApiError(429, 'rate_limited', message);
  }

  bucket.count += 1;
  buckets.set(key, bucket);
};

export const releaseMemoryLimit = (key: string) => {
  const bucket = buckets.get(key);
  if (!bucket) return;

  bucket.count = Math.max(0, bucket.count - 1);
  if (bucket.count === 0) {
    buckets.delete(key);
    return;
  }

  buckets.set(key, bucket);
};
