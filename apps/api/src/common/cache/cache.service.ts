import { Redis } from "ioredis";

class CacheManager {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
  private isRedisConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          connectTimeout: 3000,
          retryStrategy(times: number) {
            if (times > 3) return null;
            return Math.min(times * 100, 2000);
          },
        });

        this.redis.connect().then(() => {
          this.isRedisConnected = true;
        }).catch(() => {
          this.isRedisConnected = false;
        });

        this.redis.on("error", () => {
          this.isRedisConnected = false;
        });
        this.redis.on("connect", () => {
          this.isRedisConnected = true;
        });
      } catch {
        this.redis = null;
        this.isRedisConnected = false;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        const data = await this.redis.get(key);
        if (data) return JSON.parse(data) as T;
      } catch {
        // Fallback to memory cache
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 120): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
        return;
      } catch {
        // Fallback to memory cache
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        // Ignored
      }
    }
    this.memoryCache.delete(key);
  }

  async invalidatePattern(prefix: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        const keys = await this.redis.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        // Ignored
      }
    }

    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheManager();

/** Invalidate all public caches for a specific store */
export async function invalidateStoreTenantCache(storeKeyOrId: string): Promise<void> {
  await Promise.all([
    cacheService.invalidatePattern(`tenant:${storeKeyOrId}`),
    cacheService.invalidatePattern(`tenant:store:${storeKeyOrId}`),
  ]);
}
