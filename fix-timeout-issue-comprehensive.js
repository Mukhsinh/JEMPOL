const fs = require('fs');
const path = require('path');

console.log('🔧 Memulai perbaikan komprehensif masalah timeout...\n');

// Update konfigurasi API dengan timeout yang lebih besar
function updateApiConfig() {
  console.log('⚙️ Updating konfigurasi API...');
  
  const apiPath = path.join(process.cwd(), 'frontend', 'src', 'services', 'api.ts');
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ File api.ts tidak ditemukan');
    return false;
  }
  
  let content = fs.readFileSync(apiPath, 'utf8');
  
  // Update timeout menjadi lebih besar
  content = content.replace(
    /timeout:\s*\d+,.*$/gm,
    'timeout: 60000, // 60 detik untuk koneksi yang stabil'
  );
  
  // Pastikan retry logic ada
  const retryLogic = `
// Response interceptor yang dioptimalkan untuk error handling dengan retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIResponse>) => {
    let message = 'Terjadi kesalahan';

    if (error.code === 'ECONNABORTED') {
      message = 'Koneksi timeout. Mencoba ulang...';
      
      // Retry sekali untuk timeout
      if (!error.config?._retry) {
        error.config._retry = true;
        try {
          return await api.request(error.config);
        } catch (retryError) {
          message = 'Koneksi timeout. Periksa koneksi internet Anda.';
        }
      }
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
    } else if (error.code === 'ERR_CONNECTION_REFUSED') {
      message = 'Koneksi ditolak. Server tidak tersedia.';
    } else if (error.response) {
      message = error.response.data?.error || error.message || 'Terjadi kesalahan';

      // Handle authentication errors dengan optimasi
      if (error.response.status === 401 || error.response.status === 403) {
        const isTokenInvalid =
          error.response.data?.code === 'ERR_INVALID_TOKEN' ||
          error.response.data?.code === 'ERR_BAD_REQUEST' ||
          error.response.data?.error === 'Token tidak valid. Silakan login ulang.';

        if (isTokenInvalid) {
          // Clear cached token
          cachedToken = null;
          tokenCacheTime = 0;
          
          try {
            const { authService } = await import('./authService');
            await authService.logout();

            // Hanya redirect jika di halaman yang dilindungi
            const isProtectedPage =
              window.location.pathname.startsWith('/admin') ||
              window.location.pathname.startsWith('/dashboard') ||
              window.location.pathname.startsWith('/tickets') ||
              window.location.pathname.startsWith('/master-data');

            if (isProtectedPage) {
              window.location.href = '/login';
            }

            return Promise.reject(new Error('Sesi telah berakhir. Silakan login kembali.'));
          } catch (e) {
            // Silent error handling
          }
        } else {
          message = error.response.data?.error || 'Anda tidak memiliki izin untuk mengakses resource ini.';
        }
      }
    } else if (error.request) {
      message = 'Server tidak merespons. Periksa koneksi internet Anda.';
    }

    return Promise.reject(new Error(message));
  }
);`;

  // Replace response interceptor jika ada
  if (content.includes('api.interceptors.response.use')) {
    content = content.replace(
      /api\.interceptors\.response\.use\([^;]+\);/s,
      retryLogic
    );
  }
  
  fs.writeFileSync(apiPath, content);
  console.log('✅ Konfigurasi API berhasil diupdate dengan timeout 60 detik\n');
  return true;
}

// Update ComplaintService dengan fallback dan caching
function updateComplaintService() {
  console.log('📝 Updating ComplaintService dengan fallback mechanism...');
  
  const servicePath = path.join(process.cwd(), 'frontend', 'src', 'services', 'complaintService.ts');
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ ComplaintService tidak ditemukan');
    return;
  }
  
  let content = fs.readFileSync(servicePath, 'utf8');
  
  // Update getTickets method dengan fallback dan caching
  const newGetTicketsMethod = `
  // Cache untuk tickets
  private static ticketsCache: { data: Ticket[], timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 30000; // 30 detik

  async getTickets(filters: TicketFilters = {}): Promise<APIResponse<Ticket[]>> {
    try {
      console.log('🎫 Fetching tickets with filters:', filters);
      
      // Cek cache terlebih dahulu
      const now = Date.now();
      if (this.ticketsCache && (now - this.ticketsCache.timestamp) < this.CACHE_DURATION) {
        console.log('📦 Using cached tickets data');
        return {
          success: true,
          data: this.ticketsCache.data,
          message: 'Tickets berhasil diambil dari cache'
        };
      }
      
      // Coba endpoint utama dengan timeout yang lebih pendek
      try {
        const response = await api.get('/complaints', { 
          params: filters,
          timeout: 30000 // 30 detik untuk endpoint utama
        });
        
        const tickets = response.data?.data || [];
        
        // Update cache
        this.ticketsCache = {
          data: tickets,
          timestamp: now
        };
        
        console.log('✅ Tickets fetched successfully from main endpoint:', tickets.length, 'tickets');
        
        return {
          success: true,
          data: tickets,
          message: 'Tickets berhasil diambil'
        };
      } catch (mainError: any) {
        console.log('⚠️ Main endpoint failed, trying fallback...');
        
        // Fallback ke endpoint publik
        try {
          const fallbackResponse = await api.get('/public/tickets', { 
            params: filters,
            timeout: 20000 // 20 detik untuk fallback
          });
          
          const fallbackTickets = fallbackResponse.data?.data || [];
          
          // Update cache dengan data fallback
          this.ticketsCache = {
            data: fallbackTickets,
            timestamp: now
          };
          
          console.log('✅ Tickets fetched from fallback endpoint:', fallbackTickets.length, 'tickets');
          
          return {
            success: true,
            data: fallbackTickets,
            message: 'Tickets berhasil diambil dari fallback'
          };
        } catch (fallbackError: any) {
          console.error('❌ Both endpoints failed:', fallbackError.message);
          
          // Return cached data jika ada, meskipun expired
          if (this.ticketsCache) {
            console.log('📦 Using expired cache as last resort');
            return {
              success: true,
              data: this.ticketsCache.data,
              message: 'Menggunakan data cache (mungkin tidak terbaru)'
            };
          }
          
          throw mainError; // Throw original error
        }
      }
    } catch (error: any) {
      console.error('Error in getTickets:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data tiket'
      };
    }
  }`;

  // Replace getTickets method
  content = content.replace(
    /async getTickets\([^}]+\}[^}]*\}/s,
    newGetTicketsMethod
  );
  
  fs.writeFileSync(servicePath, content);
  console.log('✅ ComplaintService berhasil diupdate dengan fallback dan caching\n');
}

// Update UnitService dengan fallback
function updateUnitService() {
  console.log('🏢 Updating UnitService dengan fallback mechanism...');
  
  const servicePath = path.join(process.cwd(), 'frontend', 'src', 'services', 'unitService.ts');
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ UnitService tidak ditemukan');
    return;
  }
  
  let content = fs.readFileSync(servicePath, 'utf8');
  
  // Update getUnits method dengan timeout yang lebih besar
  content = content.replace(
    /timeout:\s*\d+/g,
    'timeout: 45000 // 45 detik untuk units'
  );
  
  fs.writeFileSync(servicePath, content);
  console.log('✅ UnitService berhasil diupdate dengan timeout yang lebih besar\n');
}

// Update MasterDataService dengan fallback
function updateMasterDataService() {
  console.log('📊 Updating MasterDataService dengan fallback mechanism...');
  
  const servicePath = path.join(process.cwd(), 'frontend', 'src', 'services', 'masterDataService.ts');
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ MasterDataService tidak ditemukan');
    return;
  }
  
  let content = fs.readFileSync(servicePath, 'utf8');
  
  // Update timeout di withPublicFallback
  content = content.replace(
    /timeout:\s*\d+/g,
    'timeout: 40000 // 40 detik untuk master data'
  );
  
  fs.writeFileSync(servicePath, content);
  console.log('✅ MasterDataService berhasil diupdate dengan timeout yang lebih besar\n');
}

// Buat loading optimizer
function createLoadingOptimizer() {
  console.log('⚡ Membuat loading optimizer...');
  
  const optimizerPath = path.join(process.cwd(), 'frontend', 'src', 'utils', 'loadingOptimizer.ts');
  
  // Pastikan folder utils ada
  const utilsDir = path.dirname(optimizerPath);
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  const optimizerContent = `// Loading optimizer untuk mengurangi beban dan timeout
export class LoadingOptimizer {
  private static loadingStates = new Map<string, boolean>();
  private static dataCache = new Map<string, { data: any, timestamp: number }>();
  private static readonly CACHE_DURATION = 60000; // 1 menit

  // Prevent duplicate requests
  static async withDeduplication<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (this.loadingStates.get(key)) {
      // Wait for existing request
      while (this.loadingStates.get(key)) {
        await this.delay(100);
      }
      
      // Check if data is now in cache
      const cached = this.getFromCache(key);
      if (cached) {
        return cached;
      }
    }

    this.loadingStates.set(key, true);
    
    try {
      const result = await operation();
      this.setCache(key, result);
      return result;
    } finally {
      this.loadingStates.set(key, false);
    }
  }

  // Cache management
  static setCache(key: string, data: any): void {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  static getFromCache(key: string): any | null {
    const cached = this.dataCache.get(key);
    if (!cached) return null;

    const isExpired = (Date.now() - cached.timestamp) > this.CACHE_DURATION;
    if (isExpired) {
      this.dataCache.delete(key);
      return null;
    }

    return cached.data;
  }

  static clearCache(key?: string): void {
    if (key) {
      this.dataCache.delete(key);
    } else {
      this.dataCache.clear();
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch requests untuk mengurangi beban
  static async batchRequests<T>(
    requests: Array<() => Promise<T>>,
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
      
      // Delay antar batch untuk mengurangi beban server
      if (i + batchSize < requests.length) {
        await this.delay(500);
      }
    }
    
    return results;
  }
}
`;

  fs.writeFileSync(optimizerPath, optimizerContent);
  console.log('✅ Loading optimizer berhasil dibuat\n');
}

// Main function
function main() {
  console.log('🚀 Memulai perbaikan timeout komprehensif...\n');
  
  // Update semua service
  updateApiConfig();
  updateComplaintService();
  updateUnitService();
  updateMasterDataService();
  createLoadingOptimizer();
  
  console.log('✅ Perbaikan timeout selesai!');
  console.log('\n📋 Perubahan yang dilakukan:');
  console.log('1. ⏱️ Timeout API ditingkatkan menjadi 60 detik');
  console.log('2. 🔄 Retry mechanism untuk timeout errors');
  console.log('3. 📦 Caching untuk mengurangi request berulang');
  console.log('4. 🔀 Fallback endpoints untuk reliability');
  console.log('5. ⚡ Loading optimizer untuk performa');
  console.log('\n🔄 Restart aplikasi untuk menerapkan perubahan:');
  console.log('   Frontend: npm run dev (di folder frontend)');
  console.log('   Backend: npm run dev (di folder backend)');
}

main();