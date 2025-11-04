import redis from "../resource/redis";
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

  async increment(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (err) {
      logger.error(`Redis INCR error: ${String(err)}`);
      return 0;
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
}

export { CacheService };
