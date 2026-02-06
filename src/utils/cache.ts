// Simple client-side cache for faster navigation
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ClientCache {
  private cache = new Map<string, CacheItem<any>>();
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Preload data for multiple products
  async preloadProducts(productSlugs: string[]): Promise<void> {
    const promises = productSlugs.map(async (slug) => {
      if (!this.get(`product-${slug}`)) {
        try {
          const encodedSlug = encodeURIComponent(slug);
          const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/slug/${encodedSlug}`);
          if (res.ok) {
            const data = await res.json();
            this.set(`product-${slug}`, data, 10 * 60 * 1000); // 10 minutes for preloaded data
          }
        } catch (e) {
          // Silent fail for prefetch
        }
      }
    });
    
    Promise.allSettled(promises); // Fire and forget
  }
}

export const productCache = new ClientCache();