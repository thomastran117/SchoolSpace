// sudo service redis-server start

import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

(async () => {
  try {
    await redis.ping();
    console.log("Redis OK");
  } catch (e) {
    console.error("Redis error", e);
  }
})();
