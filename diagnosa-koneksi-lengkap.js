const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Konfigurasi
const BACKEND_URL = 'http://localhost:3003/api';
const FRONTEND_URL = 'http://localhost:3001';

console.log('🔍 DIAGNOSA KONEKSI FRONTEND-BACKEND');
console.log('=====================================');

async function checkServerStatus() {
    console.log('\n1. CHECKING SERVER STATUS...');
    
    // Check Backend
    try {
        const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
        console.log('✅ Backend: ONLINE');
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${response.data.message}`);
    } catch (error) {
        console.log('❌ Backend: OFFLINE');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('   💡 Solusi: Jalankan "npm run dev:backend"');
        }
    }
    
    // Check Frontend (indirect)
    console.log(`\n   Frontend URL: ${FRONTEND_URL}`);
    console.log('   Status: Diasumsikan berjalan (script ini dijalankan dari frontend context)');
}

async function checkEnvironmentFiles() {
    console.log('\n2. CHECKING ENVIRONMENT FILES...');
    
    // Check frontend .env
    const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
    if (fs.existsSync(frontendEnvPath)) {
        const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
        console.log('✅ Frontend .env exists');
        
        if (frontendEnv.includes('VITE_API_URL=http://localhost:3003/api')) {
            console.log('✅ VITE_API_URL configured correctly');
        } else {
            console.log('❌ VITE_API_URL not configured correctly');
            console.log('   💡 Should be: VITE_API_URL=http://localhost:3003/api');
        }
    } else {
        console.log('❌ Frontend .env not found');
    }
    
    // Check backend .env
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    if (fs.existsSync(backendEnvPath)) {
        const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
        console.log('✅ Backend .env exists');
        
        if (backendEnv.includes('PORT=3003')) {
            console.log('✅ Backend PORT configured correctly');
        } else {
            console.log('❌ Backend PORT not configured correctly');
            console.log('   💡 Should be: PORT=3003');
        }
        
        if (backendEnv.includes('FRONTEND_URL=http://localhost:3001')) {
            console.log('✅ FRONTEND_URL configured correctly');
        } else {
            console.log('❌ FRONTEND_URL not configured correctly');
            console.log('   💡 Should be: FRONTEND_URL=http://localhost:3001');
        }
    } else {
        console.log('❌ Backend .env not found');
    }
}

async function testAPIEndpoints() {
    console.log('\n3. TESTING API ENDPOINTS...');
    
    const endpoints = [
        { path: '/health', method: 'GET', description: 'Health check' },
        { path: '/public/units', method: 'GET', description: 'Public units' },
        { path: '/test/units', method: 'GET', description: 'Test units' },
        { path: '/auth/login', method: 'POST', description: 'Auth login', 
          data: { username: 'admin', password: 'admin123' } }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const config = {
                method: endpoint.method,
                url: `${BACKEND_URL}${endpoint.path}`,
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (endpoint.data) {
                config.data = endpoint.data;
            }
            
            const response = await axios(config);
            console.log(`✅ ${endpoint.path}: SUCCESS (${response.status})`);
            
            if (Array.isArray(response.data)) {
                console.log(`   Data count: ${response.data.length}`);
            } else if (response.data && typeof response.data === 'object') {
                console.log(`   Response keys: ${Object.keys(response.data).join(', ')}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.path}: FAILED`);
            console.log(`   Status: ${error.response?.status || 'No response'}`);
            console.log(`   Error: ${error.message}`);
            
            if (error.response?.data) {
                console.log(`   Response: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
            }
        }
    }
}

async function checkCORSConfiguration() {
    console.log('\n4. CHECKING CORS CONFIGURATION...');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/health`, {
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('✅ CORS: Working');
        console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Not set'}`);
        console.log(`   Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'Not set'}`);
    } catch (error) {
        console.log('❌ CORS: Issues detected');
        console.log(`   Error: ${error.message}`);
    }
}

async function checkSupabaseConnection() {
    console.log('\n5. CHECKING SUPABASE CONNECTION...');
    
    try {
        // Test Supabase connection through backend
        const response = await axios.get(`${BACKEND_URL}/test/sla-settings`);
        console.log('✅ Supabase: Connected through backend');
        console.log(`   Response: ${response.data.message}`);
        console.log(`   Data count: ${response.data.count || 0}`);
    } catch (error) {
        console.log('❌ Supabase: Connection issues');
        console.log(`   Error: ${error.message}`);
        
        if (error.response?.data) {
            console.log(`   Details: ${JSON.stringify(error.response.data)}`);
        }
    }
}

async function generateSolutions() {
    console.log('\n6. SOLUTIONS & RECOMMENDATIONS...');
    console.log('=====================================');
    
    console.log('\n🔧 QUICK FIXES:');
    console.log('1. Restart Backend:');
    console.log('   cd backend && npm run dev');
    console.log('   atau: npm run dev:backend');
    
    console.log('\n2. Restart Frontend:');
    console.log('   cd frontend && npm run dev');
    console.log('   atau: npm run dev:frontend');
    
    console.log('\n3. Restart Both:');
    console.log('   npm run dev');
    
    console.log('\n🔍 DEBUGGING STEPS:');
    console.log('1. Check if ports are available:');
    console.log('   netstat -an | findstr :3003');
    console.log('   netstat -an | findstr :3001');
    
    console.log('\n2. Check environment variables:');
    console.log('   Frontend: VITE_API_URL=http://localhost:3003/api');
    console.log('   Backend: PORT=3003, FRONTEND_URL=http://localhost:3001');
    
    console.log('\n3. Clear cache and restart:');
    console.log('   npm run clean (if available)');
    console.log('   rm -rf node_modules && npm install');
    
    console.log('\n🌐 NETWORK TROUBLESHOOTING:');
    console.log('1. Test direct backend access:');
    console.log('   curl http://localhost:3003/api/health');
    
    console.log('\n2. Test from browser console:');
    console.log('   fetch("http://localhost:3003/api/health").then(r => r.json()).then(console.log)');
    
    console.log('\n3. Check firewall/antivirus:');
    console.log('   Temporarily disable and test');
    
    console.log('\n📝 CONFIGURATION FILES TO CHECK:');
    console.log('1. frontend/vite.config.ts - proxy configuration');
    console.log('2. backend/src/server.ts - CORS configuration');
    console.log('3. frontend/.env - API URL');
    console.log('4. backend/.env - PORT and FRONTEND_URL');
    
    console.log('\n🚨 COMMON ISSUES:');
    console.log('1. Backend not running on port 3003');
    console.log('2. CORS not allowing localhost:3001');
    console.log('3. Environment variables not loaded');
    console.log('4. Firewall blocking local connections');
    console.log('5. Multiple instances of servers running');
}

async function runDiagnosis() {
    try {
        await checkServerStatus();
        await checkEnvironmentFiles();
        await testAPIEndpoints();
        await checkCORSConfiguration();
        await checkSupabaseConnection();
        await generateSolutions();
        
        console.log('\n✅ DIAGNOSIS COMPLETE');
        console.log('=====================================');
    } catch (error) {
        console.error('\n❌ DIAGNOSIS ERROR:', error.message);
    }
}

// Run diagnosis
runDiagnosis();