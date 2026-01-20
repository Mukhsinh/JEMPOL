/**
 * Script untuk mendiagnosa masalah QR Link Settings
 * Jalankan di browser console saat membuka halaman /settings/qr-link
 */

console.log('🔍 Memulai diagnosa QR Link Settings...');

// 1. Cek apakah komponen ter-render
const checkComponent = () => {
  console.log('\n📦 Memeriksa komponen...');
  const mainContent = document.querySelector('main');
  const settingsContent = document.querySelector('[class*="settings"]');
  
  console.log('Main element:', mainContent ? '✅ Ada' : '❌ Tidak ada');
  console.log('Settings content:', settingsContent ? '✅ Ada' : '❌ Tidak ada');
  
  if (mainContent) {
    console.log('Main innerHTML length:', mainContent.innerHTML.length);
    console.log('Main children count:', mainContent.children.length);
  }
};

// 2. Cek localStorage auth
const checkAuth = () => {
  console.log('\n🔐 Memeriksa autentikasi...');
  const auth = localStorage.getItem('auth');
  
  if (auth) {
    try {
      const authData = JSON.parse(auth);
      console.log('✅ Auth data ditemukan');
      console.log('Token:', authData.token ? authData.token.substring(0, 20) + '...' : 'Tidak ada');
      console.log('User:', authData.user?.email || 'Tidak ada');
    } catch (e) {
      console.error('❌ Error parsing auth data:', e);
    }
  } else {
    console.log('❌ Tidak ada auth data di localStorage');
  }
};

// 3. Cek network requests
const checkNetwork = async () => {
  console.log('\n🌐 Memeriksa koneksi API...');
  
  const auth = localStorage.getItem('auth');
  if (!auth) {
    console.log('❌ Tidak bisa test API tanpa auth token');
    return;
  }
  
  let token;
  try {
    const authData = JSON.parse(auth);
    token = authData.token || authData.access_token;
  } catch (e) {
    console.error('❌ Error parsing auth:', e);
    return;
  }
  
  // Test units endpoint
  console.log('\n📍 Testing /api/units...');
  try {
    const unitsResponse = await fetch('http://localhost:3001/api/units', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      console.log('✅ Units API berhasil');
      console.log('Total units:', unitsData.units?.length || 0);
    } else {
      console.log('❌ Units API gagal:', unitsResponse.status, unitsResponse.statusText);
      const errorText = await unitsResponse.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Error calling units API:', error.message);
  }
  
  // Test QR codes endpoint
  console.log('\n📱 Testing /api/qr-codes...');
  try {
    const qrResponse = await fetch('http://localhost:3001/api/qr-codes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (qrResponse.ok) {
      const qrData = await qrResponse.json();
      console.log('✅ QR Codes API berhasil');
      console.log('Total QR codes:', qrData.qr_codes?.length || 0);
      if (qrData.qr_codes && qrData.qr_codes.length > 0) {
        console.log('Sample QR code:', qrData.qr_codes[0]);
      }
    } else {
      console.log('❌ QR Codes API gagal:', qrResponse.status, qrResponse.statusText);
      const errorText = await qrResponse.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Error calling QR codes API:', error.message);
  }
};

// 4. Cek React errors
const checkReactErrors = () => {
  console.log('\n⚛️ Memeriksa React errors...');
  
  // Cek apakah ada error boundary
  const errorElements = document.querySelectorAll('[class*="error"]');
  console.log('Error elements found:', errorElements.length);
  
  errorElements.forEach((el, index) => {
    console.log(`Error ${index + 1}:`, el.textContent?.substring(0, 100));
  });
};

// 5. Cek console errors
const checkConsoleErrors = () => {
  console.log('\n📋 Memeriksa console...');
  console.log('Buka tab Console untuk melihat error messages');
  console.log('Buka tab Network untuk melihat failed requests');
};

// Jalankan semua diagnosa
const runDiagnosis = async () => {
  console.log('═══════════════════════════════════════');
  console.log('  DIAGNOSA QR LINK SETTINGS');
  console.log('═══════════════════════════════════════');
  
  checkComponent();
  checkAuth();
  checkReactErrors();
  checkConsoleErrors();
  await checkNetwork();
  
  console.log('\n═══════════════════════════════════════');
  console.log('  DIAGNOSA SELESAI');
  console.log('═══════════════════════════════════════');
  console.log('\n💡 Tips:');
  console.log('1. Jika komponen tidak ter-render, cek routing di App.tsx');
  console.log('2. Jika API gagal, pastikan backend berjalan di port 3001');
  console.log('3. Jika auth error, coba login ulang');
  console.log('4. Periksa tab Network di DevTools untuk detail error');
};

// Auto-run
runDiagnosis();

// Export untuk manual run
window.diagnoseQRLink = runDiagnosis;
console.log('\n💡 Untuk run ulang, ketik: diagnoseQRLink()');
