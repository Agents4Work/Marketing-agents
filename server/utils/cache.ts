/**
 * Simple cache utility for API responses
 * Uses in-memory Maps to cache responses with TTL
 */

interface CacheItem<T> {
  value: T;
  expires: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 300 * 1000; // 5 minutes in milliseconds
  
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns The cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // If item doesn't exist or is expired
    if (!item || Date.now() > item.expires) {
      if (item) this.cache.delete(key); // Clean up expired item
      return undefined;
    }
    
    return item.value as T;
  }
  
  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time-to-live in seconds (optional, defaults to 300s)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const ttlMs = (ttl || 300) * 1000; // Convert seconds to milliseconds
    
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }
  
  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clean up expired items
   * This can be called periodically to free memory
   */
  cleanup(): void {
    const now = Date.now();
    
    // Usar Array.from para evitar problemas de iteración
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    });
  }
}

// Create a singleton instance
export const apiCache = new SimpleCache();

/**
 * Function for wrapping API calls with caching
 */
export async function withCache<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cachedData = apiCache.get<T>(cacheKey);
  
  if (cachedData !== undefined) {
    console.log(`🔄 Cache hit for key: ${cacheKey}`);
    return Promise.resolve(cachedData);
  }
  
  console.log(`🔄 Cache miss for key: ${cacheKey}`);
  return fetchFunction().then(data => {
    apiCache.set(cacheKey, data, ttl);
    return data;
  });
}

// Set up automatic cleanup every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);