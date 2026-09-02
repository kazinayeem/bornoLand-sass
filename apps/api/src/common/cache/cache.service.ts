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

export type RevalidateScope = "all" | "home" | "products" | "cms" | "theme" | "categories" | "navigation";

/** Invalidate all public caches for a specific store in Redis/Memory and trigger Next.js ISR on-demand revalidation */
export async function invalidateStoreTenantCache(
  storeKeyOrId: string,
  scope: RevalidateScope = "all",
  extra?: { productSlug?: string; categorySlug?: string; cmsSlugs?: string[] }
): Promise<void> {
  if (!storeKeyOrId) return;

  try {
    await Promise.all([
      cacheService.invalidatePattern(`tenant:${storeKeyOrId}`),
      cacheService.invalidatePattern(`tenant:store:${storeKeyOrId}`),
    ]);

    // Resolve store slug and ID
    const { StoreModel } = await import("../../models/store.model.js");
    let store: { _id: unknown; slug: string } | null = null;

    if (storeKeyOrId.match(/^[0-9a-fA-F]{24}$/)) {
      store = (await StoreModel.findById(storeKeyOrId).select("_id slug").lean()) as any;
    }
    if (!store) {
      store = (await StoreModel.findOne({
        $or: [{ slug: storeKeyOrId.toLowerCase() }, { subdomain: storeKeyOrId.toLowerCase() }],
      }).select("_id slug").lean()) as any;
    }

    if (store) {
      const secret = process.env.REVALIDATE_SECRET || "bornoland_revalidate_secret";
      const appUrl = process.env.APP_URL || process.env.WEB_URL || "http://localhost:3000";

      fetch(`${appUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
        body: JSON.stringify({
          tenantSlug: store.slug,
          storeId: String(store._id),
          scope,
          ...extra,
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((err) => {
        // Safe catch on network/timeout
        if (process.env.NODE_ENV === "development") {
          console.log(`[revalidate] Next.js revalidate notice: ${(err as Error).message}`);
        }
      });
    }
  } catch (err) {
    console.warn("[invalidateStoreTenantCache] error:", err);
  }
}
