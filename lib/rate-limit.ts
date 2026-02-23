import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

/**
 * Creates a rate limiter backed by Upstash Redis.
 * Falls back to a no-op limiter when env vars are missing (local dev).
 */
function createRatelimit(requests: number, window: string): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.warn(
      '[rate-limit] UPSTASH env vars missing — rate limiting disabled.'
    );
    return null;
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: 'groqtales:ratelimit',
  });
}

/** Pre-configured limiters per route tier */
export const rateLimiters = {
  /** AI generation endpoints — 10 req / 60 s */
  ai: createRatelimit(10, '60 s'),
  /** Publish endpoints — 5 req / 60 s */
  publish: createRatelimit(5, '60 s'),
  /** Comments / general — 30 req / 60 s */
  general: createRatelimit(30, '60 s'),
};

/**
 * Extracts the real client IP from x-forwarded-for header.
 * Takes the first (leftmost) IP, trims whitespace, falls back to request.ip or '127.0.0.1'.
 */
export function getClientIp(request: {
  headers: Headers;
  ip?: string;
}): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return request.ip ?? '127.0.0.1';
}

/**
 * Checks rate limit for the given identifier.
 * Returns a 429 NextResponse if the limit is exceeded, or `null` if allowed.
 * Fails open (returns null) on Redis/network errors to avoid blocking requests.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // rate limiting disabled

  try {
    const { success, limit, remaining, reset } =
      await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    return null;
  } catch (error) {
    console.error('[rate-limit] Redis error, failing open:', error);
    return null; // fail open — allow the request through
  }
}
