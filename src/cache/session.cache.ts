import { LRUCache } from "lru-cache";

export const sessionCache = new LRUCache<string, any>({
  max: 10000, // support up to 10k active users
  ttl: 1000 * 60 * 15, // 15 minutes
});
