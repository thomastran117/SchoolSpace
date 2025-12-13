type MemoryEntry = {
  value: string;
  expiresAt?: number;
};

class InMemoryStore {
  private store = new Map<string, MemoryEntry>();

  // -------------------------
  // Internal helpers
  // -------------------------
  private isExpired(entry?: MemoryEntry): boolean {
    return !!entry?.expiresAt && Date.now() > entry.expiresAt;
  }

  private purgeIfExpired(key: string): void {
    const entry = this.store.get(key);
    if (this.isExpired(entry)) {
      this.store.delete(key);
    }
  }

  // -------------------------
  // Redis-like API
  // -------------------------

  get(key: string): string | null {
    this.purgeIfExpired(key);
    return this.store.get(key)?.value ?? null;
  }

  set(key: string, value: string, ttlSeconds?: number): "OK" {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds
        ? Date.now() + ttlSeconds * 1000
        : undefined,
    });
    return "OK";
  }

  del(key: string | string[]): number {
    const keys = Array.isArray(key) ? key : [key];
    let removed = 0;

    for (const k of keys) {
      if (this.store.delete(k)) removed++;
    }

    return removed;
  }

  exists(key: string): number {
    this.purgeIfExpired(key);
    return this.store.has(key) ? 1 : 0;
  }

  incrby(key: string, amount = 1): number {
    const current = parseInt(this.get(key) ?? "0", 10);
    const next = current + amount;
    this.set(key, String(next));
    return next;
  }

  decrby(key: string, amount = 1): number {
    return this.incrby(key, -amount);
  }

  expire(key: string, ttlSeconds: number): number {
    const entry = this.store.get(key);
    if (!entry) return 0;

    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, entry);
    return 1;
  }

  ttl(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -2;

    if (!entry.expiresAt) return -1;

    const ttl = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  keys(pattern = "*"): string[] {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*") + "$",
    );

    return Array.from(this.store.keys()).filter((key) =>
      regex.test(key),
    );
  }

  flushall(): "OK" {
    this.store.clear();
    return "OK";
  }

  dbsize(): number {
    return this.store.size;
  }

  setNX(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): number {
    if (this.exists(key)) return 0;

    this.set(key, value, ttlSeconds);
    return 1;
  }
}

const inMemoryStore = new InMemoryStore();
export default inMemoryStore;
