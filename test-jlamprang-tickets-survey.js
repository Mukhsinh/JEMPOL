// Script untuk test pembuatan tiket internal, eksternal, dan survey dari unit Jlamprang
const API_URL = 'http://localhost:3004/api';
const UNIT_JLAMPRANG_ID = '7bac7321-86e2-4dce-936d-2adde223c314';

// Test 1: Buat Tiket Internal
async function testCreateInternalTicket() {
  console.log('\n=== TEST 1: Buat Tiket Internal ===');
  
  try {
    const response = await fetch(`${API_URL}/complaints/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Ganti dengan token valid
      },
      body: JSON.stringify({
        type: 'complaint',
        title: 'Test Tiket Internal dari Jlamprang',
        description: 'Ini adalah test tiket internal dari unit Jlamprang yang baru dibuat',
        unit_id: UNIT_JLAMPRANG_ID,
        priority: 'medium',
        submitter_name: 'Test User',
        submitter_email: 'test@example.com',
        submitter_phone: '081234567890',
        is_anonymous: false,
        source: 'web'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Tiket internal berhasil dibuat!');
      console.log('Nomor Tiket:', data.data.ticket_number);
      return data.data.id;
    } else {
      console.log('❌ Gagal membuat tiket internal:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 2: Buat Tiket Eksternal
async function testCreateExternalTicket() {
  console.log('\n=== TEST 2: Buat Tiket Eksternal ===');
  
  try {
    const response = await fetch(`${API_URL}/external-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        unit_id: UNIT_JLAMPRANG_ID,
        reporter_identity_type: 'personal',
        reporter_name: 'Test Pelapor',
        reporter_email: 'pelapor@example.com',
        reporter_phone: '081234567890',
        age_range: '20-40 Th',
        service_type: 'complaint',
        title: 'Test Tiket Eksternal dari Jlamprang',
        description: 'Ini adalah test tiket eksternal dari unit Jlamprang yang baru dibuat',
        category: 'pelayanan'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Tiket eksternal berhasil dibuat!');
      console.log('Nomor Tiket:', data.ticket_number);
      return data.ticket_id;
    } else {
      console.log('❌ Gagal membuat tiket eksternal:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 3: Submit Survey Kepuasan
async function testSubmitSurvey() {
  console.log('\n=== TEST 3: Submit Survey Kepuasan ===');
  
  try {
    const response = await fetch(`${API_URL}/public/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        unit_id: UNIT_JLAMPRANG_ID,
        service_type: 'rawat_jalan',
        reporter_name: 'Test Responden',
        reporter_phone: '081234567890',
        reporter_email: 'responden@example.com',
        is_anonymous: false,
        age_range: '20-40 Th',
        gender: 'Laki-laki',
        patient_type: 'BPJS',
        // Skor 8 pertanyaan (1-5)
        q1_score: 4,
        q2_score: 4,
        q3_score: 5,
        q4_score: 4,
        q5_score: 5,
        q6_score: 4,
        q7_score: 5,
        q8_score: 4,
        comments: 'Test survey dari unit Jlamprang. Pelayanan baik.',
        source: 'web'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Survey berhasil dikirim!');
      return data.data.id;
    } else {
      console.log('❌ Gagal mengirim survey:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 4: Cek Unit Jlamprang
async function testCheckUnit() {
  console.log('\n=== TEST 4: Cek Unit Jlamprang ===');
  
  try {
    const response = await fetch(`${API_URL}/public/units`);
    const result = await response.json();
    const data = result.data || result; // Handle both formats
    
    const jlamprang = Array.isArray(data) ? data.find(u => u.id === UNIT_JLAMPRANG_ID) : null;
    
    if (jlamprang) {
      console.log('✅ Unit Jlamprang ditemukan:');
      console.log('  - ID:', jlamprang.id);
      console.log('  - Nama:', jlamprang.name);
      console.log('  - Kode:', jlamprang.code);
      console.log('  - Status:', jlamprang.is_active ? 'Aktif' : 'Tidak Aktif');
      return true;
    } else {
      console.log('❌ Unit Jlamprang tidak ditemukan');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Jalankan semua test
async function runAllTests() {
  console.log('🚀 Memulai test untuk unit Jlamprang...\n');
  console.log('Unit ID:', UNIT_JLAMPRANG_ID);
  console.log('API URL:', API_URL);
  
  // Test 4 dulu untuk memastikan unit ada
  const unitExists = await testCheckUnit();
  
  if (!unitExists) {
    console.log('\n❌ Unit Jlamprang tidak ditemukan. Test dibatalkan.');
    return;
  }
  
  // Test tiket eksternal (tidak perlu auth)
  const externalTicketId = await testCreateExternalTicket();
  
  // Test survey (tidak perlu auth)
  const surveyId = await testSubmitSurvey();
  
  // Test tiket internal (perlu auth - akan gagal jika token tidak valid)
  console.log('\n⚠️  Test tiket internal memerlukan token autentikasi.');
  console.log('Silakan ganti YOUR_TOKEN_HERE di script dengan token valid.');
  const internalTicketId = await testCreateInternalTicket();
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('Unit Jlamprang:', unitExists ? '✅ Ditemukan' : '❌ Tidak ditemukan');
  console.log('Tiket Eksternal:', externalTicketId ? '✅ Berhasil' : '❌ Gagal');
  console.log('Survey:', surveyId ? '✅ Berhasil' : '❌ Gagal');
  console.log('Tiket Internal:', internalTicketId ? '✅ Berhasil' : '❌ Gagal (perlu token)');
  
  console.log('\n📊 Hasil Test:');
  if (externalTicketId && surveyId) {
    console.log('✅ Test berhasil! Tiket eksternal dan survey dapat dibuat dari unit Jlamprang.');
  } else {
    console.log('❌ Ada masalah dengan pembuatan tiket/survey. Periksa error di atas.');
  }
}

// Jalankan test
runAllTests().catch(console.error);
