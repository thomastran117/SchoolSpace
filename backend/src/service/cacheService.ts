import { redis } from "../resource/redis";
import logger from "../utility/logger";

type RedisOperation<T> = () => Promise<T>;

class CacheService {
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 100; // initial retry delay

  constructor() {}

  // --------------------------------------------
  // Detect transient redis errors
  // --------------------------------------------
  private isTransientError(err: any): boolean {
    if (!err) return false;

    const message = err?.message?.toLowerCase() ?? "";

    return (
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnreset") ||
      message.includes("failed to connect") ||
      message.includes("socket")
    );
  }

  private async _retry<T>(operation: RedisOperation<T>): Promise<T | null> {
    let attempt = 0;

    while (true) {
      try {
        return await operation();

      } catch (err: any) {
        if (!this.isTransientError(err) || attempt >= this.maxRetries) {
          logger.error(
            `[CacheService] fatal Redis error (no retry): ${err?.message ?? err}`
          );
          return null;
        }

        const delay =
          Math.pow(2, attempt) * this.baseDelayMs * Math.random();

        logger.warn(
          `[CacheService] transient redis error: ${err?.message ?? err}. Retrying in ${Math.round(
            delay
          )}ms (attempt ${attempt + 1}/${this.maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean | null> {
    return await this._retry(async () => {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }

      return true;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return await this._retry(async () => {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    });
  }

  async delete(key: string): Promise<boolean | null> {
    return await this._retry(async () => {
      await redis.del(key);
      return true;
    });
  }

  async exists(key: string): Promise<boolean | null> {
    return await this._retry(async () => {
      const result = await redis.exists(key);
      return result === 1;
    });
  }

  async increment(
    key: string,
    amount = 1,
    ttlSeconds?: number
  ): Promise<number | null> {
    return await this._retry(async () => {
      const count = await redis.incrby(key, amount);

      if (ttlSeconds && count === amount) {
        await redis.expire(key, ttlSeconds);
      }

      return count;
    });
  }

  async decrement(key: string, amount = 1): Promise<number | null> {
    return await this._retry(async () => {
      return await redis.decrby(key, amount);
    });
  }

  async setIfNotExists<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<boolean | null> {
    return await this._retry(async () => {
      const serialized = JSON.stringify(value);
      const result = ttlSeconds
        ? await redis.set(key, serialized, "EX", ttlSeconds, "NX")
        : await redis.set(key, serialized, "NX");

      return result === "OK";
    });
  }

  async ttl(key: string): Promise<number | null> {
    return await this._retry(async () => {
      return await redis.ttl(key);
    });
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean | null> {
    return await this._retry(async () => {
      await redis.expire(key, ttlSeconds);
      return true;
    });
  }

  async deletePattern(pattern: string): Promise<boolean | null> {
    return await this._retry(async () => {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(keys);
      return true;
    });
  }

  async clearAll(): Promise<boolean | null> {
    return await this._retry(async () => {
      await redis.flushall();
      return true;
    });
  }

  async flushPrefix(prefix: string): Promise<boolean | null> {
    return await this._retry(async () => {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length) await redis.del(keys);
      return true;
    });
  }

  async getKeys(pattern = "*"): Promise<string[] | null> {
    return await this._retry(async () => {
      return await redis.keys(pattern);
    });
  }

  async size(): Promise<number | null> {
    return await this._retry(async () => {
      return await redis.dbsize();
    });
  }
}

export { CacheService };
