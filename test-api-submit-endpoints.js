// Test script untuk mengecek endpoint submit tiket internal dan survey
const API_BASE_URL = 'http://localhost:3004';

async function testInternalTicketEndpoint() {
  console.log('\n🧪 Testing Internal Ticket Endpoint...');
  console.log('='.repeat(50));
  
  try {
    const payload = {
      reporter_name: 'Test User',
      reporter_email: 'test@example.com',
      reporter_phone: '081234567890',
      reporter_department: 'IT Department',
      reporter_position: 'Staff',
      category: 'it_support',
      priority: 'medium',
      title: 'Test Tiket Internal',
      description: 'Ini adalah test tiket internal untuk memastikan endpoint berfungsi',
      unit_id: '00000000-0000-0000-0000-000000000001', // Ganti dengan unit_id yang valid
      source: 'web'
    };

    console.log('📤 Mengirim request ke /api/public/internal-tickets');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/public/internal-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers.get('content-type'));

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response bukan JSON!');
      console.error('Response:', text.substring(0, 500));
      return false;
    }

    const result = await response.json();
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ Internal Ticket Endpoint: BERHASIL');
      console.log('✅ Ticket Number:', result.ticket_number);
      return true;
    } else {
      console.error('❌ Internal Ticket Endpoint: GAGAL');
      console.error('Error:', result.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Internal Ticket Endpoint: ERROR');
    console.error('Error:', error.message);
    return false;
  }
}

async function testSurveyEndpoint() {
  console.log('\n🧪 Testing Survey Endpoint...');
  console.log('='.repeat(50));
  
  try {
    const payload = {
      unit_id: '00000000-0000-0000-0000-000000000001', // Ganti dengan unit_id yang valid
      visitor_phone: '081234567890',
      visitor_name: 'Test User',
      is_anonymous: false,
      age_range: '25-34',
      gender: 'male',
      service_type: 'rawat_jalan',
      // Skor indikator (contoh untuk 3 unsur pertama)
      u1_ind1_score: 4,
      u1_ind2_score: 5,
      u1_ind3_score: 4,
      u2_ind1_score: 4,
      u2_ind2_score: 4,
      u2_ind3_score: 5,
      u3_ind1_score: 3,
      u3_ind2_score: 4,
      u3_ind3_score: 4,
      overall_score: 4,
      comments: 'Test survey untuk memastikan endpoint berfungsi',
      source: 'public_survey'
    };

    console.log('📤 Mengirim request ke /api/public/surveys');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/public/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers.get('content-type'));

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response bukan JSON!');
      console.error('Response:', text.substring(0, 500));
      return false;
    }

    const result = await response.json();
    console.log('📥 Response data:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ Survey Endpoint: BERHASIL');
      return true;
    } else {
      console.error('❌ Survey Endpoint: GAGAL');
      console.error('Error:', result.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Survey Endpoint: ERROR');
    console.error('Error:', error.message);
    return false;
  }
}

async function testUnitsEndpoint() {
  console.log('\n🧪 Testing Units Endpoint (untuk mendapatkan unit_id yang valid)...');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/units`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('📥 Response status:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response bukan JSON!');
      console.error('Response:', text.substring(0, 500));
      return null;
    }

    const result = await response.json();
    
    if (response.ok) {
      const units = result.data || result;
      if (Array.isArray(units) && units.length > 0) {
        console.log('✅ Units Endpoint: BERHASIL');
        console.log('✅ Total units:', units.length);
        console.log('✅ Unit pertama:', units[0].name, '(ID:', units[0].id + ')');
        return units[0].id;
      }
    }
    
    console.error('❌ Units Endpoint: Tidak ada data unit');
    return null;
  } catch (error) {
    console.error('❌ Units Endpoint: ERROR');
    console.error('Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('\n🚀 MEMULAI TEST ENDPOINT SUBMIT');
  console.log('='.repeat(50));
  
  // Test 1: Get valid unit_id
  const validUnitId = await testUnitsEndpoint();
  
  if (!validUnitId) {
    console.error('\n❌ TIDAK DAPAT MELANJUTKAN TEST');
    console.error('Tidak ada unit yang tersedia. Pastikan database memiliki data unit.');
    return;
  }

  // Update payload dengan unit_id yang valid
  console.log('\n📝 Menggunakan unit_id:', validUnitId);

  // Test 2: Internal Ticket
  const internalTicketSuccess = await testInternalTicketEndpoint();

  // Test 3: Survey
  const surveySuccess = await testSurveyEndpoint();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 RINGKASAN TEST');
  console.log('='.repeat(50));
  console.log('Units Endpoint:', validUnitId ? '✅ BERHASIL' : '❌ GAGAL');
  console.log('Internal Ticket Endpoint:', internalTicketSuccess ? '✅ BERHASIL' : '❌ GAGAL');
  console.log('Survey Endpoint:', surveySuccess ? '✅ BERHASIL' : '❌ GAGAL');
  console.log('='.repeat(50));

  if (internalTicketSuccess && surveySuccess) {
    console.log('\n🎉 SEMUA TEST BERHASIL!');
    console.log('Endpoint submit tiket internal dan survey berfungsi dengan baik.');
  } else {
    console.log('\n⚠️ ADA TEST YANG GAGAL!');
    console.log('Periksa log di atas untuk detail error.');
  }
}

// Jalankan test
runTests().catch(console.error);
