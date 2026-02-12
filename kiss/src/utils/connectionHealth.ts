import { supabase } from './supabaseClient';

export class ConnectionHealth {
  private static instance: ConnectionHealth;
  private isHealthy: boolean = true;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 detik

  static getInstance(): ConnectionHealth {
    if (!ConnectionHealth.instance) {
      ConnectionHealth.instance = new ConnectionHealth();
    }
    return ConnectionHealth.instance;
  }

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Skip jika baru saja dicek
    if (now - this.lastCheck < 5000) {
      return this.isHealthy;
    }

    try {
      const startTime = Date.now();
      const { error } = await supabase
        .from('admins')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.error('❌ Health check failed:', error.message);
        this.isHealthy = false;
      } else {
        this.isHealthy = true;
        if (responseTime > 5000) {
          console.warn(`⚠️ Slow response: ${responseTime}ms`);
        }
      }
    } catch (error) {
      console.error('❌ Health check error:', error);
      this.isHealthy = false;
    }

    this.lastCheck = now;
    return this.isHealthy;
  }

  isConnectionHealthy(): boolean {
    return this.isHealthy;
  }

  startMonitoring(): void {
    setInterval(() => {
      this.checkHealth();
    }, this.checkInterval);
  }
}

export const connectionHealth = ConnectionHealth.getInstance();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  connectionHealth.startMonitoring();
}
