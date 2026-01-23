const fetch = require('node-fetch');

// Script untuk mendiagnosa masalah submit tiket internal

async function diagnoseSubmitError() {
  console.log('🔍 Mendiagnosa masalah submit tiket internal...\n');

  // 1. Test koneksi ke backend
  console.log('1️⃣ Testing backend connection...');
  try {
    const response = await fetch('http://localhost:5000/api/public/units', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend berjalan dengan baik');
      console.log('   📊 Units tersedia:', data.data?.length || 0);
    } else {
      console.log('   ❌ Backend error:', response.statusText);
    }
  } catch (error) {
    console.log('   ❌ Tidak dapat terhubung ke backend');
    console.log('   Error:', error.message);
    console.log('   💡 Pastikan backend berjalan di port 5000');
  }

  console.log('\n2️⃣ Testing internal-tickets endpoint...');
  try {
    // Get unit ID first
    const unitsResponse = await fetch('http://localhost:5000/api/public/units');
    const unitsData = await unitsResponse.json();
    const firstUnit = unitsData.data?.[0];

    if (!firstUnit) {
      console.log('   ❌ Tidak ada unit tersedia untuk testing');
      return;
    }

    console.log('   📍 Using unit:', firstUnit.name, '(' + firstUnit.id + ')');

    // Test submit
    const testPayload = {
      reporter_name: 'Test User',
      reporter_email: 'test@example.com',
      reporter_phone: '08123456789',
      reporter_department: firstUnit.name,
      reporter_position: 'Tester',
      category: 'it_support',
      priority: 'medium',
      title: 'Test Ticket - Diagnosa',
      description: 'Ini adalah test ticket untuk diagnosa masalah submit',
      unit_id: firstUnit.id,
      source: 'web'
    };

    console.log('   📤 Sending test payload...');
    const response = await fetch('http://localhost:5000/api/public/internal-tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers.get('content-type'));

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('   ✅ Submit berhasil!');
        console.log('   🎫 Ticket number:', result.ticket_number);
      } else {
        console.log('   ❌ Submit gagal');
        console.log('   Error:', result.error);
        if (result.details) {
          console.log('   Details:', result.details);
        }
      }
    } else {
      const text = await response.text();
      console.log('   ❌ Response bukan JSON!');
      console.log('   Response:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('   ❌ Error saat testing endpoint');
    console.log('   Error:', error.message);
  }

  console.log('\n3️⃣ Checking environment variables...');
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: Set`);
    } else {
      console.log(`   ❌ ${envVar}: Not set`);
    }
  }

  console.log('\n📋 Diagnosis Summary:');
  console.log('   1. Pastikan backend berjalan di port 5000');
  console.log('   2. Pastikan route /api/public/internal-tickets terdaftar');
  console.log('   3. Pastikan Supabase credentials valid');
  console.log('   4. Pastikan tabel tickets memiliki struktur yang benar');
  console.log('   5. Periksa console backend untuk error detail');
}

// Run diagnosis
diagnoseSubmitError().catch(console.error);
