const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🔧 Memulai perbaikan komprehensif masalah timeout...\n');

// Test koneksi ke backend
async function testBackendConnection() {
  console.log('📡 Testing koneksi backend...');
  
  const backendUrls = [
    'http://localhost:3001/api/health',
    'http://localhost:3003/api/health',
    'http://localhost:3004/api/health'
  ];
  
  for (const url of backendUrls) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`✅ Backend tersedia di: ${url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
      return url.replace('/api/health', '');
    } catch (error) {
      console.log(`❌ Backend tidak tersedia di: ${url}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
  
  return null;
}

// Test koneksi Supabase
async function testSupabaseConnection() {
  console.log('🗄️ Testing koneksi Supabase...');
  
  try {
    const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
    const response = await axios.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg'
      },
      timeout: 10000
    });
    
    console.log('✅ Supabase tersedia');
    console.log(`   Status: ${response.status}\n`);
    return true;
  } catch (error) {
    console.log('❌ Supabase tidak tersedia');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Update konfigurasi API
function updateApiConfig(backendUrl) {
  console.log('⚙️ Updating konfigurasi API...');
  
  const apiPath = path.join(process.cwd(), 'frontend', 'src', 'services', 'api.ts');
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ File api.ts tidak ditemukan');
    return false;
  }
  
  let content = fs.readFileSync(apiPath, 'utf8');
  
  // Update timeout
  content = content.replace(
    /timeout:\s*\d+,/g,
    'timeout: 30000, // 30 detik untuk koneksi yang stabil'
  );
  
  // Update base URL untuk development
  const correctUrl = backendUrl || 'http://localhost:3001';
  content = content.replace(
    /cachedApiBaseUrl = 'http:\/\/localhost:\d+\/api';/g,
    `cachedApiBaseUrl = '${correctUrl}/api';`
  );
  
  fs.writeFileSync(apiPath, content);
  console.log('✅ Konfigurasi API berhasil diupdate\n');
  return true;
}

// Update environment variables
function updateEnvironmentVariables(backendUrl) {
  console.log('🌍 Updating environment variables...');
  
  const frontendEnvPath = path.join(process.cwd(), 'frontend', '.env');
  const backendEnvPath = path.join(process.cwd(), 'backend', '.env');
  
  // Update frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    const correctUrl = backendUrl || 'http://localhost:3001';
    frontendEnv = frontendEnv.replace(
      /VITE_API_URL=.*/,
      `VITE_API_URL=${correctUrl}/api`
    );
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Frontend .env berhasil diupdate');
  }
  
  // Update backend .env
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Pastikan PORT konsisten
    if (!backendEnv.includes('PORT=3001')) {
      backendEnv = backendEnv.replace(/PORT=\d+/, 'PORT=3001');
      fs.writeFileSync(backendEnvPath, backendEnv);
      console.log('✅ Backend .env berhasil diupdate');
    }
  }
  
  console.log('');
}

// Buat service untuk retry mechanism
function createRetryService() {
  console.log('🔄 Membuat retry service...');
  
  const retryServicePath = path.join(process.cwd(), 'frontend', 'src', 'services', 'retryService.ts');
  
  const retryServiceContent = `// Retry service untuk menangani timeout dan connection errors
export class RetryService {
  private static maxRetries = 3;
  private static baseDelay = 1000; // 1 detik

  static async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(\`🔄 Retry attempt \${this.maxRetries - retries + 1}/\${this.maxRetries}\`);
        
        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        await this.delay(delay);
        
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private static shouldRetry(error: any): boolean {
    // Retry untuk timeout, network errors, dan server errors
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ERR_CONNECTION_REFUSED' ||
      (error.response && error.response.status >= 500)
    );
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
`;

  fs.writeFileSync(retryServicePath, retryServiceContent);
  console.log('✅ Retry service berhasil dibuat\n');
}

// Update complaintService untuk menggunakan retry
function updateComplaintService() {
  console.log('📝 Updating ComplaintService dengan retry mechanism...');
  
  const servicePath = path.join(process.cwd(), 'frontend', 'src', 'services', 'complaintService.ts');
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ ComplaintService tidak ditemukan');
    return;
  }
  
  let content = fs.readFileSync(servicePath, 'utf8');
  
  // Add retry import jika belum ada
  if (!content.includes('RetryService')) {
    content = content.replace(
      "import { APIResponse } from '../types';",
      "import { APIResponse } from '../types';\nimport { RetryService } from './retryService';"
    );
  }
  
  // Update getTickets method dengan retry
  content = content.replace(
    /async getTickets\([^}]+\}/s,
    `async getTickets(filters: TicketFilters = {}): Promise<APIResponse<Ticket[]>> {
    try {
      console.log('🎫 Fetching tickets with filters:', filters);
      
      const response = await RetryService.withRetry(async () => {
        return await api.get('/complaints', { params: filters });
      });
      
      console.log('✅ Tickets fetched successfully:', response.data?.data?.length || 0, 'tickets');
      
      return {
        success: true,
        data: response.data?.data || [],
        message: 'Tickets berhasil diambil'
      };
    } catch (error: any) {
      console.error('Error in getTickets:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data tiket'
      };
    }
  }`
  );
  
  fs.writeFileSync(servicePath, content);
  console.log('✅ ComplaintService berhasil diupdate dengan retry mechanism\n');
}

// Main function
async function main() {
  console.log('🚀 Memulai diagnosis dan perbaikan timeout...\n');
  
  // Test koneksi
  const backendUrl = await testBackendConnection();
  const supabaseOk = await testSupabaseConnection();
  
  if (!backendUrl) {
    console.log('❌ Backend tidak tersedia di port manapun!');
    console.log('💡 Pastikan backend berjalan dengan: npm run dev di folder backend\n');
  }
  
  if (!supabaseOk) {
    console.log('❌ Supabase tidak tersedia!');
    console.log('💡 Periksa koneksi internet dan konfigurasi Supabase\n');
  }
  
  // Update konfigurasi
  updateApiConfig(backendUrl);
  updateEnvironmentVariables(backendUrl);
  createRetryService();
  updateComplaintService();
  
  console.log('✅ Perbaikan timeout selesai!');
  console.log('\n📋 Langkah selanjutnya:');
  console.log('1. Restart frontend: npm run dev di folder frontend');
  console.log('2. Restart backend: npm run dev di folder backend');
  console.log('3. Test aplikasi di browser');
  console.log('\n🔍 Jika masih ada masalah, periksa:');
  console.log('- Koneksi internet');
  console.log('- Firewall/antivirus yang memblokir port');
  console.log('- Process yang menggunakan port 3001');
}

main().catch(console.error);