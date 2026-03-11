// This module exposes a Redis-like client.  In local/dev environments we
// use a lightweight in-memory mock to avoid having to run a real server.  In
// production we create a real client (currently Upstash) whenever a connection
// URL is supplied via environment variables (either REDIS_URL or the
// UPSTASH_REDIS_* vars).  The rest of the app code can `import { redis }` and
// use it without worrying about which implementation is in use.

import { Redis as UpstashRedis } from '@upstash/redis';

// ----------------------------------------------------------
// Mock Redis class (in-memory, for development without a server)
// ----------------------------------------------------------
class MockRedis {
  private cache: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    console.log(`[MockRedis] Getting key: ${key}`);
    return this.cache.get(key) || null;
  }
  async set(key: string, value: any): Promise<'OK'> {
    console.log(`[MockRedis] Setting key: ${key}`);
    this.cache.set(key, value);
    return 'OK';
  }
  async del(key: string): Promise<number> {
    console.log(`[MockRedis] Deleting key: ${key}`);
    const existed = this.cache.has(key);
    this.cache.delete(key);
    return existed ? 1 : 0;
  }
  async ping(): Promise<string> {
    return 'PONG';
  }
  async pipeline(): Promise<any> {
    // basic no-op pipeline for compatibility
    return { exec: async () => [] };
  }
  // add other methods as needed by callers
}

// ----------------------------------------------------------
// Factory logic
// ----------------------------------------------------------
let client: any;

// Upstash envs take precedence
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  client = UpstashRedis.fromEnv();
  console.log('[redis] Using Upstash Redis (from UPSTASH_REDIS_REST_URL)');
} else if (process.env.REDIS_URL) {
  // Fallback: allow a generic REDIS_URL for self-hosted installations
  client = new UpstashRedis({ url: process.env.REDIS_URL });
  console.log('[redis] Using Upstash Redis (from REDIS_URL)');
} else {
  client = new MockRedis();
  console.log('[redis] Using mock Redis implementation');
}

export const redis = client;
