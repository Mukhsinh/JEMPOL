// Comprehensive diagnosis script for loading issue
const axios = require('axios');

async function diagnoseLoadingIssue() {
  console.log('🔍 DIAGNOSA MASALAH LOADING APLIKASI');
  console.log('=====================================\n');

  const results = {
    backend: false,
    supabase: false,
    auth: false,
    frontend: false,
    issues: []
  };

  // 1. Check Backend Status
  console.log('1️⃣ Memeriksa Status Backend...');
  try {
    const backendResponse = await axios.get('http://localhost:3003/api/health', {
      timeout: 5000
    });
    
    if (backendResponse.status === 200) {
      console.log('✅ Backend berjalan normal');
      results.backend = true;
    } else {
      console.log('❌ Backend response tidak normal:', backendResponse.status);
      results.issues.push('Backend tidak merespons dengan benar');
    }
  } catch (error) {
    console.log('❌ Backend tidak dapat diakses:', error.message);
    results.issues.push('Backend tidak berjalan atau tidak dapat diakses');
  }

  // 2. Check Supabase Connection
  console.log('\n2️⃣ Memeriksa Koneksi Supabase...');
  try {
    const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
    
    const supabaseResponse = await axios.get(`${supabaseUrl}/rest/v1/admins?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (supabaseResponse.status === 200) {
      console.log('✅ Supabase dapat diakses');
      results.supabase = true;
    } else {
      console.log('❌ Supabase response tidak normal:', supabaseResponse.status);
      results.issues.push('Supabase tidak merespons dengan benar');
    }
  } catch (error) {
    console.log('❌ Supabase tidak dapat diakses:', error.message);
    results.issues.push('Koneksi ke Supabase gagal');
  }

  // 3. Check Auth Endpoint
  console.log('\n3️⃣ Memeriksa Auth Endpoint...');
  try {
    const authResponse = await axios.post('http://localhost:3003/api/auth/login', {
      email: 'test@example.com',
      password: 'test'
    }, {
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    });

    if (authResponse.status === 400 || authResponse.status === 401) {
      console.log('✅ Auth endpoint merespons (expected 400/401 for invalid credentials)');
      results.auth = true;
    } else if (authResponse.status === 200) {
      console.log('✅ Auth endpoint berfungsi');
      results.auth = true;
    } else {
      console.log('❌ Auth endpoint response tidak normal:', authResponse.status);
      results.issues.push('Auth endpoint tidak berfungsi dengan benar');
    }
  } catch (error) {
    console.log('❌ Auth endpoint tidak dapat diakses:', error.message);
    results.issues.push('Auth endpoint tidak dapat diakses');
  }

  // 4. Check Frontend Accessibility
  console.log('\n4️⃣ Memeriksa Frontend...');
  try {
    const frontendResponse = await axios.get('http://localhost:3001', {
      timeout: 5000
    });
    
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend dapat diakses');
      results.frontend = true;
    } else {
      console.log('❌ Frontend response tidak normal:', frontendResponse.status);
      results.issues.push('Frontend tidak merespons dengan benar');
    }
  } catch (error) {
    console.log('❌ Frontend tidak dapat diakses:', error.message);
    results.issues.push('Frontend tidak berjalan atau tidak dapat diakses');
  }

  // 5. Summary and Recommendations
  console.log('\n📋 RINGKASAN DIAGNOSA');
  console.log('====================');
  console.log(`Backend: ${results.backend ? '✅' : '❌'}`);
  console.log(`Supabase: ${results.supabase ? '✅' : '❌'}`);
  console.log(`Auth: ${results.auth ? '✅' : '❌'}`);
  console.log(`Frontend: ${results.frontend ? '✅' : '❌'}`);

  if (results.issues.length > 0) {
    console.log('\n🚨 MASALAH YANG DITEMUKAN:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  console.log('\n💡 REKOMENDASI PERBAIKAN:');
  
  if (!results.backend) {
    console.log('🔧 Backend tidak berjalan:');
    console.log('   - Jalankan: cd backend && npm start');
    console.log('   - Periksa port 3003 tidak digunakan aplikasi lain');
    console.log('   - Periksa file .env backend');
  }

  if (!results.supabase) {
    console.log('🔧 Masalah Supabase:');
    console.log('   - Periksa koneksi internet');
    console.log('   - Verifikasi SUPABASE_URL dan SUPABASE_ANON_KEY');
    console.log('   - Periksa status Supabase project');
  }

  if (!results.auth) {
    console.log('🔧 Masalah Authentication:');
    console.log('   - Periksa tabel admins di Supabase');
    console.log('   - Verifikasi RLS policies');
    console.log('   - Periksa auth middleware backend');
  }

  if (!results.frontend) {
    console.log('🔧 Frontend tidak berjalan:');
    console.log('   - Jalankan: cd frontend && npm run dev');
    console.log('   - Periksa port 3001 tidak digunakan aplikasi lain');
    console.log('   - Periksa file .env frontend');
  }

  // Specific fix for loading issue
  if (results.frontend && results.backend && results.supabase) {
    console.log('\n🎯 KEMUNGKINAN PENYEBAB LOADING TERUS-MENERUS:');
    console.log('1. AuthContext stuck dalam infinite loop');
    console.log('2. Supabase session tidak dapat diverifikasi');
    console.log('3. RLS policies memblokir akses');
    console.log('4. Token authentication bermasalah');
    console.log('5. React StrictMode menyebabkan double initialization');
  }

  return results;
}

// Run diagnosis
diagnoseLoadingIssue().catch(console.error);