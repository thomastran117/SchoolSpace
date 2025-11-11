import { redis } from "../resource/redis";
import logger from "../utility/logger";

class CacheService {
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
    } catch (err) {
      logger.error(`Redis SET error: ${String(err)}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (err) {
      logger.error(`Redis GET error: ${String(err)}`);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error(`Redis DEL error: ${String(err)}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1;
    } catch (err) {
      logger.error(`Redis EXISTS error: ${String(err)}`);
      return false;
    }
  }

  async increment(
    key: string,
    amount = 1,
    ttlSeconds?: number,
  ): Promise<number> {
    try {
      const count = await redis.incrby(key, amount);

      if (ttlSeconds && count === amount) {
        await redis.expire(key, ttlSeconds);
      }

      return count;
    } catch (err) {
      logger.error(`Redis INCRBY error: ${String(err)}`);
      return 0;
    }
  }

  async decrement(key: string, amount = 1): Promise<number> {
    try {
      return await redis.decrby(key, amount);
    } catch (err) {
      logger.error(`Redis DECRBY error: ${String(err)}`);
      return 0;
    }
  }

  async setIfNotExists<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const result = ttlSeconds
        ? await redis.set(key, serialized, "EX", ttlSeconds, "NX")
        : await redis.set(key, serialized, "NX");
      return result === "OK";
    } catch (err) {
      logger.error(`Redis SETNX error: ${String(err)}`);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (err) {
      logger.error(`Redis TTL error: ${String(err)}`);
      return -2;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.expire(key, ttlSeconds);
    } catch (err) {
      logger.error(`Redis EXPIRE error: ${String(err)}`);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(keys);
  }
}

export { CacheService };
