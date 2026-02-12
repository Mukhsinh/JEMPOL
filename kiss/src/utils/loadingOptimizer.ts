
// Loading optimizer untuk mengatasi masalah performa
export class LoadingOptimizer {
  private static loadingStates = new Map<string, boolean>();
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 60000; // 1 menit

  // Debounce function untuk mengurangi request berlebihan
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Cache dengan TTL
  static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Loading state management
  static setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
  }

  static isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  // Batch requests untuk mengurangi beban server
  static async batchRequests<T>(
    requests: (() => Promise<T>)[],
    batchSize: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(request => request())
      );
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.warn('Batch request failed:', result.reason);
        }
      });
      
      // Delay antar batch untuk mengurangi beban
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}
