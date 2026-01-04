// Script untuk mengoptimalkan loading dan mengatasi timeout
const fs = require('fs');
const path = require('path');

console.log('🔧 Mengoptimalkan konfigurasi untuk mengatasi timeout...');

// 1. Optimasi complaintService dengan retry mechanism
const complaintServicePath = path.join(__dirname, 'frontend/src/services/complaintService.ts');
if (fs.existsSync(complaintServicePath)) {
  let content = fs.readFileSync(complaintServicePath, 'utf8');
  
  // Tambahkan retry mechanism
  const retryFunction = `
  // Retry mechanism untuk request yang gagal
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        console.log(\`🔄 Retry attempt \${i + 1}/\${maxRetries}\`);
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }
  `;
  
  // Cari posisi untuk menambahkan retry function
  if (!content.includes('retryRequest')) {
    const insertPos = content.indexOf('private static readonly CACHE_DURATION');
    if (insertPos !== -1) {
      content = content.slice(0, insertPos) + retryFunction + '\n  ' + content.slice(insertPos);
      fs.writeFileSync(complaintServicePath, content);
      console.log('✅ Retry mechanism ditambahkan ke complaintService');
    }
  }
}

// 2. Optimasi API timeout configuration
const apiPath = path.join(__dirname, 'frontend/src/services/api.ts');
if (fs.existsSync(apiPath)) {
  let content = fs.readFileSync(apiPath, 'utf8');
  
  // Update timeout dan tambahkan retry interceptor
  content = content.replace(
    /timeout: \d+,/g,
    'timeout: 45000, // 45 detik untuk koneksi lambat'
  );
  
  // Tambahkan retry interceptor jika belum ada
  if (!content.includes('axios-retry')) {
    const retryInterceptor = `
// Retry interceptor untuk request yang gagal
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Jika belum ada retry count, set ke 0
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }
    
    // Retry maksimal 3 kali untuk error timeout atau network
    if (
      config.__retryCount < 3 &&
      (error.code === 'ECONNABORTED' || 
       error.code === 'ERR_NETWORK' ||
       error.code === 'ERR_CONNECTION_REFUSED')
    ) {
      config.__retryCount += 1;
      console.log(\`🔄 Retrying request (\${config.__retryCount}/3): \${config.url}\`);
      
      // Delay sebelum retry
      await new Promise(resolve => setTimeout(resolve, 1000 * config.__retryCount));
      
      return api(config);
    }
    
    return Promise.reject(error);
  }
);
`;
    
    // Tambahkan setelah api instance dibuat
    const insertPos = content.indexOf('// Request interceptor');
    if (insertPos !== -1) {
      content = content.slice(0, insertPos) + retryInterceptor + '\n' + content.slice(insertPos);
      fs.writeFileSync(apiPath, content);
      console.log('✅ Retry interceptor ditambahkan ke API service');
    }
  }
}

// 3. Optimasi Vite config untuk build yang lebih cepat
const viteConfigPath = path.join(__dirname, 'frontend/vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  let content = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Tambahkan optimasi untuk development
  if (!content.includes('hmr: {')) {
    content = content.replace(
      'server: {',
      `server: {
    hmr: {
      overlay: false, // Disable error overlay untuk performa
    },`
    );
  }
  
  // Tambahkan optimasi build
  if (!content.includes('esbuild: {')) {
    content = content.replace(
      'build: {',
      `build: {
    target: 'es2015', // Target yang lebih lama untuk kompatibilitas
    esbuild: {
      drop: ['console', 'debugger'], // Remove console logs di production
    },`
    );
  }
  
  fs.writeFileSync(viteConfigPath, content);
  console.log('✅ Vite config dioptimalkan');
}

// 4. Buat file optimasi loading
const loadingOptimizerPath = path.join(__dirname, 'frontend/src/utils/loadingOptimizer.ts');
const loadingOptimizerContent = `
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
`;

fs.writeFileSync(loadingOptimizerPath, loadingOptimizerContent);
console.log('✅ Loading optimizer dibuat');

console.log('\n🎉 Optimasi selesai! Jalankan FIX_TIMEOUT_DAN_LOADING_ISSUE.bat untuk memulai aplikasi.');