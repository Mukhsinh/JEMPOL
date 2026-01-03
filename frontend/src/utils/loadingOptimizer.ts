// Loading optimizer untuk mengatasi masalah loading
export class LoadingOptimizer {
  private static instance: LoadingOptimizer;
  private loadingStates: Map<string, boolean> = new Map();
  private timeouts: Map<string, number> = new Map();

  static getInstance(): LoadingOptimizer {
    if (!LoadingOptimizer.instance) {
      LoadingOptimizer.instance = new LoadingOptimizer();
    }
    return LoadingOptimizer.instance;
  }

  setLoading(key: string, isLoading: boolean, timeout: number = 10000): void {
    // Clear existing timeout
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    this.loadingStates.set(key, isLoading);

    if (isLoading) {
      // Set timeout untuk auto-clear loading state
      const timeoutId = window.setTimeout(() => {
        console.warn(`⚠️ Loading timeout untuk ${key}, auto-clearing...`);
        this.loadingStates.set(key, false);
        this.timeouts.delete(key);
      }, timeout);
      
      this.timeouts.set(key, timeoutId);
    } else {
      this.timeouts.delete(key);
    }
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  clearAll(): void {
    this.timeouts.forEach(timeout => window.clearTimeout(timeout));
    this.timeouts.clear();
    this.loadingStates.clear();
  }
}

export const loadingOptimizer = LoadingOptimizer.getInstance();
