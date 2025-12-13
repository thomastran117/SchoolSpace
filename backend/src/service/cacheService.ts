import { redis } from "../resource/redis";
import inMemoryStore from "../resource/inmemoryStore";
import logger from "../utility/logger";

type RedisOperation<T> = () => Promise<T>;

class CacheService {
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 100;

  private async _retry<T>(operation: RedisOperation<T>): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await operation();
      } catch (err: any) {
        if (!this.isTransientError(err) || attempt >= this.maxRetries) {
          throw err;
        }

        const delay =
          Math.pow(2, attempt) * this.baseDelayMs * Math.random();

        logger.warn(
          `[CacheService] transient redis error: ${err?.message ?? err}. Retrying in ${Math.round(
            delay,
          )}ms (attempt ${attempt + 1}/${this.maxRetries})`,
        );

        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }
  }

  private isTransientError(err: any): boolean {
    if (!err) return false;

    const msg = err?.message?.toLowerCase() ?? "";

    return (
      msg.includes("connection") ||
      msg.includes("timeout") ||
      msg.includes("network") ||
      msg.includes("econnreset") ||
      msg.includes("failed to connect") ||
      msg.includes("socket")
    );
  }

  private async withFallback<T>(
    redisOp: () => Promise<T>,
    memoryOp: () => T,
  ): Promise<T | null> {
    try {
      return await this._retry(redisOp);
    } catch (err: any) {
      logger.warn(
        `[CacheService] Redis unavailable, using in-memory fallback: ${err?.message ?? err}`,
      );
      return memoryOp();
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<boolean | null> {
    const serialized = JSON.stringify(value);

    return this.withFallback(
      async () => {
        ttlSeconds
          ? await redis.set(key, serialized, "EX", ttlSeconds)
          : await redis.set(key, serialized);
        return true;
      },
      () => {
        inMemoryStore.set(key, serialized, ttlSeconds);
        return true;
      },
    );
  }

  async get<T>(key: string): Promise<T | null> {
    return this.withFallback(
      async () => {
        const raw = await redis.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      },
      () => {
        const raw = inMemoryStore.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      },
    );
  }

  async delete(key: string): Promise<boolean | null> {
    return this.withFallback(
      async () => {
        await redis.del(key);
        return true;
      },
      () => {
        inMemoryStore.del(key);
        return true;
      },
    );
  }

  async exists(key: string): Promise<boolean | null> {
    return this.withFallback(
      async () => (await redis.exists(key)) === 1,
      () => inMemoryStore.exists(key) === 1,
    );
  }

  async increment(
    key: string,
    amount = 1,
    ttlSeconds?: number,
  ): Promise<number | null> {
    return this.withFallback(
      async () => {
        const count = await redis.incrby(key, amount);
        if (ttlSeconds && count === amount) {
          await redis.expire(key, ttlSeconds);
        }
        return count;
      },
      () => {
        const count = inMemoryStore.incrby(key, amount);
        if (ttlSeconds && count === amount) {
          inMemoryStore.expire(key, ttlSeconds);
        }
        return count;
      },
    );
  }

  async decrement(key: string, amount = 1): Promise<number | null> {
    return this.withFallback(
      async () => redis.decrby(key, amount),
      () => inMemoryStore.decrby(key, amount),
    );
  }

  async setIfNotExists<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<boolean | null> {
    const serialized = JSON.stringify(value);

    return this.withFallback(
      async () => {
        const result = ttlSeconds
          ? await redis.set(key, serialized, "EX", ttlSeconds, "NX")
          : await redis.set(key, serialized, "NX");
        return result === "OK";
      },
      () => inMemoryStore.setNX(key, serialized, ttlSeconds) === 1,
    );
  }

  async ttl(key: string): Promise<number | null> {
    return this.withFallback(
      async () => redis.ttl(key),
      () => inMemoryStore.ttl(key),
    );
  }

  async clearAll(): Promise<boolean | null> {
    return this.withFallback(
      async () => {
        await redis.flushall();
        return true;
      },
      () => {
        inMemoryStore.flushall();
        return true;
      },
    );
  }

  async size(): Promise<number | null> {
    return this.withFallback(
      async () => redis.dbsize(),
      () => inMemoryStore.dbsize(),
    );
  }
}

export { CacheService };
