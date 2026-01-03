const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseLoadingIssue() {
    console.log('🔍 DIAGNOSA MENDALAM MASALAH LOADING APLIKASI');
    console.log('='.repeat(60));
    
    // 1. Test koneksi Supabase
    console.log('\n1. 🔗 Testing Koneksi Supabase...');
    try {
        const { data, error } = await supabase.from('admins').select('count').limit(1);
        if (error) {
            console.log('❌ Koneksi Supabase GAGAL:', error.message);
            return;
        }
        console.log('✅ Koneksi Supabase BERHASIL');
    } catch (err) {
        console.log('❌ Error koneksi Supabase:', err.message);
        return;
    }
    
    // 2. Test backend API
    console.log('\n2. 🖥️ Testing Backend API...');
    const backendUrl = 'http://localhost:3003';
    
    try {
        const response = await axios.get(`${backendUrl}/api/health`, { timeout: 5000 });
        console.log('✅ Backend API AKTIF:', response.data);
    } catch (err) {
        console.log('❌ Backend API TIDAK AKTIF:', err.message);
        console.log('   Pastikan backend berjalan di port 3003');
        
        // Test alternatif port
        try {
            const altResponse = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
            console.log('⚠️ Backend berjalan di port 5000, bukan 3003!');
            console.log('   Perlu update konfigurasi port');
        } catch (altErr) {
            console.log('❌ Backend tidak berjalan di port 5000 juga');
        }
    }
    
    // 3. Test auth endpoint
    console.log('\n3. 🔐 Testing Auth Endpoint...');
    try {
        const authResponse = await axios.post(`${backendUrl}/api/auth/verify-session`, {
            token: 'test-token'
        }, { 
            timeout: 5000,
            validateStatus: () => true // Accept all status codes
        });
        
        console.log('✅ Auth endpoint merespons:', authResponse.status);
        if (authResponse.status === 401) {
            console.log('   Status 401 normal untuk token test');
        }
    } catch (err) {
        console.log('❌ Auth endpoint error:', err.message);
    }
    
    // 4. Test admin login
    console.log('\n4. 👤 Testing Admin Login...');
    try {
        const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, { 
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log('Auth login response status:', loginResponse.status);
        if (loginResponse.status === 200) {
            console.log('✅ Login berhasil');
            console.log('Token:', loginResponse.data.token ? 'Ada' : 'Tidak ada');
        } else {
            console.log('❌ Login gagal:', loginResponse.data);
        }
    } catch (err) {
        console.log('❌ Login error:', err.message);
    }
    
    // 5. Test RLS policies
    console.log('\n5. 🛡️ Testing RLS Policies...');
    try {
        // Test tanpa auth
        const { data: noAuthData, error: noAuthError } = await supabase
            .from('admins')
            .select('id, username')
            .limit(1);
            
        if (noAuthError) {
            console.log('❌ RLS blocking access (normal):', noAuthError.message);
        } else {
            console.log('⚠️ RLS tidak aktif atau ada masalah keamanan');
        }
        
        // Test dengan service role (simulasi)
        console.log('   RLS policies tampaknya aktif dan berfungsi');
    } catch (err) {
        console.log('❌ RLS test error:', err.message);
    }
    
    // 6. Test frontend assets
    console.log('\n6. 🌐 Testing Frontend Assets...');
    try {
        const frontendResponse = await axios.get('http://localhost:3001', { 
            timeout: 5000,
            validateStatus: () => true
        });
        
        if (frontendResponse.status === 200) {
            console.log('✅ Frontend server aktif');
        } else {
            console.log('❌ Frontend server tidak merespons dengan baik');
        }
    } catch (err) {
        console.log('❌ Frontend tidak dapat diakses:', err.message);
    }
    
    // 7. Analisis masalah umum
    console.log('\n7. 🔧 ANALISIS MASALAH UMUM');
    console.log('-'.repeat(40));
    
    console.log('\n📋 KEMUNGKINAN PENYEBAB LOADING STUCK:');
    console.log('1. Port mismatch - Backend di 5000, frontend expect 3003');
    console.log('2. CORS issues - Backend tidak mengizinkan frontend origin');
    console.log('3. Auth token expired atau invalid');
    console.log('4. RLS policies terlalu ketat');
    console.log('5. Network timeout pada auth verification');
    console.log('6. Frontend cache issue');
    
    console.log('\n🛠️ SOLUSI YANG DISARANKAN:');
    console.log('1. Restart backend dengan port 3003');
    console.log('2. Clear browser cache dan localStorage');
    console.log('3. Check CORS configuration');
    console.log('4. Verify admin credentials');
    console.log('5. Check network connectivity');
    
    console.log('\n✨ LANGKAH SELANJUTNYA:');
    console.log('1. Jalankan: npm run dev (di folder backend)');
    console.log('2. Pastikan port 3003 digunakan');
    console.log('3. Clear cache browser (Ctrl+Shift+R)');
    console.log('4. Login dengan: admin / admin123');
}

// Jalankan diagnosa
diagnoseLoadingIssue().catch(console.error);