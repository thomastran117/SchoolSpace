import { redis } from "../resource/redis";
import logger from "../utility/logger";
import { HttpError, httpError } from "../utility/httpUtility";

class CacheService {
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] set failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] get failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] delete failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] exist failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async increment(key: string, amount = 1, ttlSeconds?: number): Promise<number> {
    try {
      const count = await redis.incrby(key, amount);

      if (ttlSeconds && count === amount) {
        await redis.expire(key, ttlSeconds);
      }

      return count;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] increment failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async decrement(key: string, amount = 1): Promise<number> {
    try {
      return await redis.decrby(key, amount);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] decrement failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async setIfNotExists<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const result = ttlSeconds
        ? await redis.set(key, serialized, "EX", ttlSeconds, "NX")
        : await redis.set(key, serialized, "NX");

      return result === "OK";
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] setIfNotExists failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] ttl failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.expire(key, ttlSeconds);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] expire failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(keys);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] deletePattern failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async clearAll(): Promise<void> {
    try {
      await redis.flushall();
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] clearAll failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async flushPrefix(prefix: string): Promise<void> {
    try {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length) await redis.del(keys);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] flushPrefix failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async getKeys(pattern = "*"): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] getKeys failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  async size(): Promise<number> {
    try {
      return await redis.dbsize();
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CacheService] size failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }
}

export { CacheService };
