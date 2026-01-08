interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getOrSet<T>(key: string, ttl: number, resolver: () => Promise<T>): Promise<T>;
  increment(key: string, amount: number, ttlSeconds?: number): Promise<number>;
  decrement(key: string, amount: number): Promise<void>;
  setIfNotExists<T>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): Promise<boolean>;
  ttl(key: string): Promise<number | null>;
  clearAll(): Promise<void>;
  size(): Promise<number | null>;
  compareAndSwap<T>(
    key: string,
    expected: T | null,
    value: T,
    ttlSeconds?: number
  ): Promise<boolean>;
}

export type { ICacheService };
