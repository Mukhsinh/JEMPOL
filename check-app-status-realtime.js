const { createClient } = require('@supabase/supabase-js');
const http = require('http');

// Konfigurasi
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, anonKey);

// Fungsi untuk cek status port
function checkPort(port, host = 'localhost') {
  return new Promise((resolve) => {
    const req = http.request({
      host,
      port,
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Fungsi untuk cek database
async function checkDatabase() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('admins')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;
    
    return {
      status: !error,
      responseTime,
      error: error?.message
    };
  } catch (err) {
    return {
      status: false,
      responseTime: 0,
      error: err.message
    };
  }
}

// Fungsi untuk cek auth
async function checkAuth() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (error) {
      return { status: false, error: error.message };
    }

    // Sign out setelah test
    await supabase.auth.signOut();
    
    return { 
      status: true, 
      user: data.user?.email 
    };
  } catch (err) {
    return { 
      status: false, 
      error: err.message 
    };
  }
}

// Fungsi utama monitoring
async function monitorApp() {
  console.clear();
  console.log('🔍 MONITORING STATUS APLIKASI KISS');
  console.log('=====================================');
  console.log(`⏰ ${new Date().toLocaleString()}`);
  console.log('');

  // 1. Cek Backend (Port 3004)
  const backendStatus = await checkPort(3004);
  console.log(`🔧 Backend (Port 3004): ${backendStatus ? '✅ AKTIF' : '❌ TIDAK AKTIF'}`);

  // 2. Cek Frontend (Port 3002)  
  const frontendStatus = await checkPort(3002);
  console.log(`🌐 Frontend (Port 3002): ${frontendStatus ? '✅ AKTIF' : '❌ TIDAK AKTIF'}`);

  // 3. Cek Database
  const dbResult = await checkDatabase();
  console.log(`💾 Database: ${dbResult.status ? '✅ TERHUBUNG' : '❌ ERROR'} (${dbResult.responseTime}ms)`);
  if (!dbResult.status) {
    console.log(`   Error: ${dbResult.error}`);
  }

  // 4. Cek Authentication
  const authResult = await checkAuth();
  console.log(`🔐 Authentication: ${authResult.status ? '✅ BERFUNGSI' : '❌ ERROR'}`);
  if (!authResult.status) {
    console.log(`   Error: ${authResult.error}`);
  } else {
    console.log(`   User: ${authResult.user}`);
  }

  // 5. Status keseluruhan
  const overallStatus = backendStatus && frontendStatus && dbResult.status && authResult.status;
  console.log('');
  console.log(`📊 STATUS KESELURUHAN: ${overallStatus ? '✅ SEMUA BERFUNGSI' : '⚠️ ADA MASALAH'}`);

  if (overallStatus) {
    console.log('');
    console.log('🎉 APLIKASI SIAP DIGUNAKAN!');
    console.log('   URL: http://localhost:3002');
    console.log('   Login: admin@jempol.com / admin123');
  } else {
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    if (!backendStatus) console.log('   - Jalankan backend: cd backend && npm run dev');
    if (!frontendStatus) console.log('   - Jalankan frontend: cd frontend && npm run dev');
    if (!dbResult.status) console.log('   - Cek koneksi internet dan Supabase');
    if (!authResult.status) console.log('   - Cek kredensial admin di database');
  }

  console.log('');
  console.log('Press Ctrl+C untuk berhenti...');
}

// Jalankan monitoring setiap 10 detik
console.log('🚀 Memulai monitoring aplikasi...');
console.log('Press Ctrl+C untuk berhenti');

monitorApp();
setInterval(monitorApp, 10000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Monitoring dihentikan');
  process.exit(0);
});