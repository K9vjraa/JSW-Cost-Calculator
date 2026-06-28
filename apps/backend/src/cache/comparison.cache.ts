/**
 * Simple In-Memory Cache Wrapper for the Comparison Module.
 * Note: In a production cluster, this should be replaced with Redis.
 */
export class ComparisonCache {
  private static store = new Map<string, { value: any; expiry: number }>();

  static async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  static async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  static async clearPattern(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}
