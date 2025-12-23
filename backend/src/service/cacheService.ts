import { isRedisHealthy, redis } from "../resource/redis";
import logger from "../utility/logger";

class CacheCircuitBreaker {
  private failures = 0;
  private openUntil = 0;

  private readonly FAILURE_THRESHOLD = 3;
  private readonly OPEN_DURATION_MS = 10_000;

  isOpen(): boolean {
    return Date.now() < this.openUntil;
  }

  recordSuccess(): void {
    this.failures = 0;
  }

  recordFailure(): void {
    this.failures++;

    if (this.failures >= this.FAILURE_THRESHOLD) {
      this.openUntil = Date.now() + this.OPEN_DURATION_MS;
      this.failures = 0;

      logger.warn(
        `[CacheService] Redis circuit opened for ${this.OPEN_DURATION_MS}ms`,
      );
    }
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("cache timeout")), timeoutMs),
    ),
  ]);
}

class CacheService {
  private readonly CACHE_TIMEOUT_MS = 40;
  private readonly circuit = new CacheCircuitBreaker();

  private canUseRedis(): boolean {
    return isRedisHealthy() && !this.circuit.isOpen();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.canUseRedis()) return null;

    try {
      const raw = await withTimeout(redis.get(key), this.CACHE_TIMEOUT_MS);

      if (raw) {
        this.circuit.recordSuccess();
        return JSON.parse(raw) as T;
      }

      return null;
    } catch (err: any) {
      this.circuit.recordFailure();
      logger.warn(
        `[CacheService] Redis GET skipped (${key}): ${err?.message ?? err}`,
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.canUseRedis()) return;

    const serialized = JSON.stringify(value);

    Promise.resolve()
      .then(() =>
        ttlSeconds !== undefined
          ? redis.set(key, serialized, "EX", ttlSeconds)
          : redis.set(key, serialized),
      )
      .then(() => this.circuit.recordSuccess())
      .catch((err) => {
        this.circuit.recordFailure();
        logger.warn(
          `[CacheService] Redis SET failed (${key}): ${err?.message ?? err}`,
        );
      });
  }

  async delete(key: string): Promise<void> {
    if (!this.canUseRedis()) return;

    redis.del(key).catch((err) => {
      this.circuit.recordFailure();
      logger.warn(
        `[CacheService] Redis DEL failed (${key}): ${err?.message ?? err}`,
      );
    });
  }

  async exists(key: string): Promise<boolean> {
    if (!this.canUseRedis()) return false;

    try {
      const result = await withTimeout(
        redis.exists(key),
        this.CACHE_TIMEOUT_MS,
      );
      this.circuit.recordSuccess();
      return result === 1;
    } catch {
      this.circuit.recordFailure();
      return false;
    }
  }

  async getOrSet<T>(
    key: string,
    ttl: number,
    resolver: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;

    const value = await resolver();
    await this.set(key, value, ttl);
    return value;
  }

  async increment(
    key: string,
    amount = 1,
    ttlSeconds?: number,
  ): Promise<number> {
    if (!this.canUseRedis()) {
      return amount;
    }

    try {
      const count = await redis.incrby(key, amount);

      if (ttlSeconds !== undefined && count === amount) {
        await redis.expire(key, ttlSeconds);
      }

      this.circuit.recordSuccess();
      return count;
    } catch (err: any) {
      this.circuit.recordFailure();
      logger.warn(
        `[CacheService] Redis INCR failed (${key}): ${err?.message ?? err}`,
      );

      return amount;
    }
  }

  async decrement(key: string, amount = 1): Promise<void> {
    if (!this.canUseRedis()) return;

    redis.decrby(key, amount).catch((err) => {
      this.circuit.recordFailure();
      logger.warn(
        `[CacheService] Redis DECR failed (${key}): ${err?.message ?? err}`,
      );
    });
  }

  async setIfNotExists<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<boolean> {
    if (!this.canUseRedis()) return false;

    const serialized = JSON.stringify(value);

    try {
      const result = await (redis.set as any)(
        key,
        serialized,
        "NX",
        ...(ttlSeconds !== undefined ? ["EX", ttlSeconds] : []),
      );
      if (result === "OK") {
        this.circuit.recordSuccess();
        return true;
      }

      return false;
    } catch (err: any) {
      this.circuit.recordFailure();
      logger.warn(
        `[CacheService] Redis SETNX failed (${key}): ${err?.message ?? err}`,
      );
      return false;
    }
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.canUseRedis()) return null;

    try {
      const ttl = await withTimeout(redis.ttl(key), this.CACHE_TIMEOUT_MS);
      this.circuit.recordSuccess();
      return ttl;
    } catch {
      this.circuit.recordFailure();
      return null;
    }
  }

  async clearAll(): Promise<void> {
    if (!this.canUseRedis()) return;

    redis.flushall().catch((err) => {
      this.circuit.recordFailure();
      logger.warn(
        `[CacheService] Redis FLUSHALL failed: ${err?.message ?? err}`,
      );
    });
  }

  async size(): Promise<number | null> {
    if (!this.canUseRedis()) return null;

    try {
      const size = await withTimeout(redis.dbsize(), this.CACHE_TIMEOUT_MS);
      this.circuit.recordSuccess();
      return size;
    } catch {
      this.circuit.recordFailure();
      return null;
    }
  }
}

export { CacheService };
