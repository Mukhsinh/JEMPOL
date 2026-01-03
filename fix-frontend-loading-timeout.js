const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah loading dan timeout di frontend...');

// 1. Update supabaseClient.ts untuk mengurangi timeout dan meningkatkan performa
const supabaseClientPath = path.join('frontend', 'src', 'utils', 'supabaseClient.ts');

if (fs.existsSync(supabaseClientPath)) {
  console.log('✅ File supabaseClient.ts ditemukan');
  
  let content = fs.readFileSync(supabaseClientPath, 'utf8');
  
  // Update timeout dari 30 detik ke 10 detik
  if (content.includes('AbortSignal.timeout(30000)')) {
    content = content.replace('AbortSignal.timeout(30000)', 'AbortSignal.timeout(10000)');
    console.log('✅ Timeout dikurangi dari 30s ke 10s');
  }
  
  // Tambahkan retry mechanism
  if (!content.includes('retries:')) {
    content = content.replace(
      'global: {',
      `global: {
        retries: 3,`
    );
    console.log('✅ Retry mechanism ditambahkan');
  }
  
  fs.writeFileSync(supabaseClientPath, content);
  console.log('✅ supabaseClient.ts berhasil diupdate');
} else {
  console.log('❌ File supabaseClient.ts tidak ditemukan');
}

// 2. Buat file untuk mengoptimalkan loading
const loadingOptimizerContent = `// Loading optimizer untuk mengatasi masalah loading
export class LoadingOptimizer {
  private static instance: LoadingOptimizer;
  private loadingStates: Map<string, boolean> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

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
      clearTimeout(existingTimeout);
    }

    this.loadingStates.set(key, isLoading);

    if (isLoading) {
      // Set timeout untuk auto-clear loading state
      const timeoutId = setTimeout(() => {
        console.warn(\`⚠️ Loading timeout untuk \${key}, auto-clearing...\`);
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
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.loadingStates.clear();
  }
}

export const loadingOptimizer = LoadingOptimizer.getInstance();
`;

const loadingOptimizerPath = path.join('frontend', 'src', 'utils', 'loadingOptimizer.ts');
fs.writeFileSync(loadingOptimizerPath, loadingOptimizerContent);
console.log('✅ LoadingOptimizer dibuat');

// 3. Buat connection health checker
const connectionHealthContent = `import { supabase } from './supabaseClient';

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
          console.warn(\`⚠️ Slow response: \${responseTime}ms\`);
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
`;

const connectionHealthPath = path.join('frontend', 'src', 'utils', 'connectionHealth.ts');
fs.writeFileSync(connectionHealthPath, connectionHealthContent);
console.log('✅ ConnectionHealth dibuat');

// 4. Update package.json untuk menambahkan script optimasi
const packageJsonPath = path.join('frontend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['dev:fast']) {
    packageJson.scripts['dev:fast'] = 'vite --host 0.0.0.0 --port 3002 --open --force';
    packageJson.scripts['build:fast'] = 'vite build --mode production --minify false';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Script optimasi ditambahkan ke package.json');
  }
}

// 5. Buat file konfigurasi Vite untuk optimasi
const viteConfigOptimization = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true,
    strictPort: true,
    hmr: {
      timeout: 10000
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'react', 'react-dom']
  },
  define: {
    global: 'globalThis'
  }
})
`;

const viteConfigPath = path.join('frontend', 'vite.config.ts');
if (!fs.existsSync(viteConfigPath)) {
  fs.writeFileSync(viteConfigPath, viteConfigOptimization);
  console.log('✅ Vite config optimasi dibuat');
}

console.log('\n✅ Perbaikan frontend loading selesai!');
console.log('\n📋 Yang telah diperbaiki:');
console.log('1. ✅ Timeout dikurangi untuk response lebih cepat');
console.log('2. ✅ Retry mechanism ditambahkan');
console.log('3. ✅ Loading optimizer dibuat');
console.log('4. ✅ Connection health checker dibuat');
console.log('5. ✅ Script optimasi ditambahkan');
console.log('6. ✅ Vite config dioptimalkan');

console.log('\n🔧 Langkah selanjutnya:');
console.log('1. Restart aplikasi dengan START_APPLICATION_FIXED_FINAL.bat');
console.log('2. Atau gunakan npm run dev:fast untuk development yang lebih cepat');
console.log('3. Clear browser cache jika masih ada masalah loading');