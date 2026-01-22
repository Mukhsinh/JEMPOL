// Script untuk test pembuatan tiket eksternal dan survey dari unit Jlamprang
const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:5000';
const UNIT_ID = '7bac7321-86e2-4dce-936d-2adde223c314'; // Jlamprang
const UNIT_NAME = 'Jlamprang';

console.log('🧪 Testing Tiket Eksternal dan Survey untuk Unit:', UNIT_NAME);
console.log('📍 Unit ID:', UNIT_ID);
console.log('');

// Test 1: Buat Tiket Eksternal
async function testCreateExternalTicket() {
  console.log('📝 Test 1: Membuat Tiket Eksternal...');
  
  try {
    const ticketData = {
      unit_id: UNIT_ID,
      reporter_identity_type: 'personal',
      reporter_name: 'Test User Jlamprang',
      reporter_email: 'test@jlamprang.com',
      reporter_phone: '081234567890',
      reporter_address: 'Jl. Test No. 123',
      age_range: '20-40 Th',
      service_type: 'complaint', // complaint, request, suggestion, survey
      service_category_id: null, // Opsional
      patient_type_id: null, // Opsional
      title: 'Test Tiket Eksternal dari Jlamprang',
      description: 'Ini adalah test tiket eksternal yang dibuat dari unit Jlamprang untuk memastikan sistem berfungsi dengan baik.',
      source: 'web'
    };

    console.log('📤 Mengirim data tiket:', {
      unit_id: ticketData.unit_id,
      reporter_name: ticketData.reporter_name,
      service_type: ticketData.service_type,
      title: ticketData.title
    });

    const response = await fetch(`${BACKEND_URL}/api/public/external-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Tiket eksternal berhasil dibuat!');
      console.log('   Nomor Tiket:', result.ticket_number);
      console.log('   Ticket ID:', result.data?.id);
      console.log('');
      return result.ticket_number;
    } else {
      console.error('❌ Gagal membuat tiket eksternal');
      console.error('   Error:', result.error);
      console.error('   Details:', result.details);
      console.error('   Response:', JSON.stringify(result, null, 2));
      console.log('');
      return null;
    }
  } catch (error) {
    console.error('❌ Error saat membuat tiket eksternal:', error.message);
    console.log('');
    return null;
  }
}

// Test 2: Buat Survey Kepuasan
async function testCreateSurvey() {
  console.log('📊 Test 2: Membuat Survey Kepuasan...');
  
  try {
    const surveyData = {
      unit_id: UNIT_ID,
      service_type: 'rawat_jalan',
      service_category_id: null, // Opsional
      visitor_name: 'Test Responden Jlamprang',
      visitor_email: 'responden@jlamprang.com',
      visitor_phone: '081234567891',
      is_anonymous: false,
      age_range: '20-40 Th',
      gender: 'Laki-laki',
      education: 'S1',
      job: 'Pegawai Swasta',
      patient_type: 'BPJS',
      // Skor pertanyaan (1-5)
      q1_score: 4, // Persyaratan
      q2_score: 4, // Prosedur
      q3_score: 5, // Waktu
      q4_score: 4, // Biaya
      q5_score: 5, // Produk
      q6_score: 4, // Kompetensi
      q7_score: 5, // Perilaku
      q8_score: 4, // Pengaduan
      overall_score: 4,
      comments: 'Pelayanan sangat baik dan ramah. Terima kasih!',
      source: 'web'
    };

    console.log('📤 Mengirim data survey:', {
      unit_id: surveyData.unit_id,
      visitor_name: surveyData.visitor_name,
      service_type: surveyData.service_type,
      overall_score: surveyData.overall_score
    });

    const response = await fetch(`${BACKEND_URL}/api/public/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(surveyData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Survey berhasil dibuat!');
      console.log('   Survey ID:', result.data?.id);
      console.log('   Message:', result.message);
      console.log('');
      return result.data?.id;
    } else {
      console.error('❌ Gagal membuat survey');
      console.error('   Error:', result.error);
      console.error('   Response:', JSON.stringify(result, null, 2));
      console.log('');
      return null;
    }
  } catch (error) {
    console.error('❌ Error saat membuat survey:', error.message);
    console.log('');
    return null;
  }
}

// Test 3: Verifikasi data tersimpan
async function verifyData(ticketNumber, surveyId) {
  console.log('🔍 Test 3: Verifikasi Data...');
  
  // Verifikasi tiket
  if (ticketNumber) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/public/tickets/${ticketNumber}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Tiket ditemukan di database');
        console.log('   Status:', result.data.status);
        console.log('   Unit:', result.data.units?.name);
      } else {
        console.error('❌ Tiket tidak ditemukan');
      }
    } catch (error) {
      console.error('❌ Error verifikasi tiket:', error.message);
    }
  }
  
  console.log('');
  
  // Verifikasi survey
  if (surveyId) {
    console.log('✅ Survey ID tersimpan:', surveyId);
    console.log('   (Survey dapat dilihat di dashboard admin)');
  }
  
  console.log('');
}

// Jalankan semua test
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST PEMBUATAN TIKET DAN SURVEY - UNIT JLAMPRANG');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  // Test 1: Buat tiket eksternal
  const ticketNumber = await testCreateExternalTicket();
  
  // Test 2: Buat survey
  const surveyId = await testCreateSurvey();
  
  // Test 3: Verifikasi
  await verifyData(ticketNumber, surveyId);
  
  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RINGKASAN HASIL TEST');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('Tiket Eksternal:', ticketNumber ? '✅ BERHASIL' : '❌ GAGAL');
  console.log('Survey Kepuasan:', surveyId ? '✅ BERHASIL' : '❌ GAGAL');
  console.log('');
  
  if (ticketNumber && surveyId) {
    console.log('🎉 SEMUA TEST BERHASIL!');
    console.log('');
    console.log('Unit Jlamprang sudah dapat:');
    console.log('  ✓ Membuat tiket eksternal');
    console.log('  ✓ Mengisi survey kepuasan');
    console.log('');
  } else {
    console.log('⚠️  BEBERAPA TEST GAGAL');
    console.log('');
    console.log('Silakan periksa:');
    if (!ticketNumber) {
      console.log('  ✗ Endpoint /api/public/external-tickets');
      console.log('  ✗ Validasi service_type (complaint, request, suggestion, survey)');
      console.log('  ✗ Mapping ke tabel tickets');
    }
    if (!surveyId) {
      console.log('  ✗ Endpoint /api/public/surveys');
      console.log('  ✗ Tabel public_surveys');
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
}

// Jalankan test
runAllTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
