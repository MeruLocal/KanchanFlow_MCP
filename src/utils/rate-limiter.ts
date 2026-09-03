/**
 * Fixed-window, in-memory rate limiter for the HTTP transport.
 *
 * One process, one map. That is the right scope: this server holds no shared
 * state, so a horizontally scaled deployment gets per-instance limits, which
 * is a documented property rather than a bug. Nothing here is a security
 * boundary on its own — it exists to stop one client exhausting the process.
 */

export interface RateLimitDecision {
  allowed: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  resetSeconds: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly buckets = new Map<string, Bucket>();

  constructor(limitPerWindow: number, windowMs = 60_000) {
    this.limit = limitPerWindow;
    this.windowMs = windowMs;
  }

  get enabled(): boolean {
    return this.limit > 0;
  }

  check(key: string, now = Date.now()): RateLimitDecision {
    if (!this.enabled) {
      return { allowed: true, remaining: Number.POSITIVE_INFINITY, resetSeconds: 0 };
    }

    // Opportunistic sweep so a long-lived process cannot accumulate a bucket
    // per address seen since boot.
    if (this.buckets.size > 10_000) this.sweep(now);

    const bucket = this.buckets.get(key);
    if (!bucket || now - bucket.windowStart >= this.windowMs) {
      this.buckets.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: this.limit - 1,
        resetSeconds: Math.ceil(this.windowMs / 1000),
      };
    }

    bucket.count += 1;
    const resetSeconds = Math.ceil((bucket.windowStart + this.windowMs - now) / 1000);
    return {
      allowed: bucket.count <= this.limit,
      remaining: Math.max(0, this.limit - bucket.count),
      resetSeconds,
    };
  }

  private sweep(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.windowStart >= this.windowMs) this.buckets.delete(key);
    }
  }

  reset(): void {
    this.buckets.clear();
  }
}
