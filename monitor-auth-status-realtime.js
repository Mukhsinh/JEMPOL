const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3004';

let checkCount = 0;
const maxChecks = 30; // Monitor selama 5 menit (30 x 10 detik)

async function checkFrontendStatus() {
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    return {
      status: 'running',
      statusCode: response.status,
      message: 'Frontend accessible'
    };
  } catch (error) {
    return {
      status: 'error',
      statusCode: error.response?.status || 0,
      message: error.code === 'ECONNREFUSED' ? 'Frontend not running' : error.message
    };
  }
}

async function checkBackendStatus() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    return {
      status: 'running',
      statusCode: response.status,
      message: 'Backend healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      statusCode: error.response?.status || 0,
      message: error.code === 'ECONNREFUSED' ? 'Backend not running' : error.message
    };
  }
}

async function checkAuthEndpoint() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test'
    }, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    return {
      status: response.status < 500 ? 'running' : 'error',
      statusCode: response.status,
      message: response.status === 401 ? 'Auth endpoint responding (invalid credentials expected)' : 
               response.status < 500 ? 'Auth endpoint accessible' : 'Auth endpoint error'
    };
  } catch (error) {
    return {
      status: 'error',
      statusCode: error.response?.status || 0,
      message: error.code === 'ECONNREFUSED' ? 'Auth endpoint not accessible' : error.message
    };
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'running': return '✅';
    case 'error': return '❌';
    default: return '⚠️';
  }
}

async function performHealthCheck() {
  checkCount++;
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`\n🔍 Health Check #${checkCount} - ${timestamp}`);
  console.log('═'.repeat(50));
  
  const [frontend, backend, auth] = await Promise.all([
    checkFrontendStatus(),
    checkBackendStatus(),
    checkAuthEndpoint()
  ]);
  
  console.log(`${getStatusIcon(frontend.status)} Frontend: ${frontend.message} (${frontend.statusCode})`);
  console.log(`${getStatusIcon(backend.status)} Backend:  ${backend.message} (${backend.statusCode})`);
  console.log(`${getStatusIcon(auth.status)} Auth:     ${auth.message} (${auth.statusCode})`);
  
  const allRunning = frontend.status === 'running' && backend.status === 'running' && auth.status === 'running';
  
  if (allRunning) {
    console.log('\n🎉 Semua service berjalan dengan baik!');
    console.log('🌐 Akses aplikasi di: http://localhost:3001');
    console.log('🔐 Login dengan: admin@jempol.com / admin123');
    
    if (checkCount >= 3) {
      console.log('\n✅ Monitoring selesai - aplikasi stabil');
      process.exit(0);
    }
  } else {
    console.log('\n⚠️ Ada service yang belum berjalan dengan baik');
  }
  
  if (checkCount >= maxChecks) {
    console.log('\n⏰ Monitoring timeout - silakan periksa manual');
    process.exit(1);
  }
}

console.log('🚀 Memulai monitoring status aplikasi...');
console.log('📊 Akan memonitor selama maksimal 5 menit');
console.log('🔄 Tekan Ctrl+C untuk menghentikan monitoring\n');

// Jalankan health check setiap 10 detik
const interval = setInterval(performHealthCheck, 10000);

// Jalankan health check pertama segera
performHealthCheck();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitoring dihentikan oleh user');
  clearInterval(interval);
  process.exit(0);
});