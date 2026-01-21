// Test API untuk Permintaan dan Saran
const testData = {
  request: {
    reporter_identity_type: 'personal',
    reporter_name: 'Test User Permintaan',
    reporter_email: 'test@example.com',
    reporter_phone: '081234567890',
    service_type: 'request',
    title: 'Test Permintaan Informasi',
    description: 'Ini adalah test untuk permintaan informasi',
    unit_id: '2d9dc859-d6a3-4d0d-93b6-9b416b774fc2',
    source: 'web'
  },
  suggestion: {
    reporter_identity_type: 'personal',
    reporter_name: 'Test User Saran',
    reporter_email: 'test@example.com',
    reporter_phone: '081234567890',
    service_type: 'suggestion',
    title: 'Test Saran dan Masukan',
    description: 'Ini adalah test untuk saran dan masukan',
    unit_id: '2d9dc859-d6a3-4d0d-93b6-9b416b774fc2',
    source: 'web'
  },
  complaint: {
    reporter_identity_type: 'personal',
    reporter_name: 'Test User Pengaduan',
    reporter_email: 'test@example.com',
    reporter_phone: '081234567890',
    service_type: 'complaint',
    title: 'Test Pengaduan',
    description: 'Ini adalah test untuk pengaduan (kontrol)',
    unit_id: '2d9dc859-d6a3-4d0d-93b6-9b416b774fc2',
    source: 'web'
  }
};

async function testAPI(type, data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing ${type.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const response = await fetch('http://localhost:3004/api/public/external-tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    console.log(`\n📊 Response Status: ${response.status}`);
    console.log(`📊 Response OK: ${response.ok}`);
    
    if (response.ok && result.success) {
      console.log(`\n✅ BERHASIL!`);
      console.log(`📝 Nomor Tiket: ${result.ticket_number}`);
      console.log(`📝 Data:`, JSON.stringify(result, null, 2));
    } else {
      console.log(`\n❌ GAGAL!`);
      console.log(`📝 Error: ${result.error}`);
      console.log(`📝 Details:`, JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log(`\n❌ ERROR!`);
    console.log(`📝 Message: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🚀 Memulai Test API Permintaan dan Saran\n');
  
  // Test 1: Permintaan (Request)
  await testAPI('PERMINTAAN', testData.request);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Saran (Suggestion)
  await testAPI('SARAN', testData.suggestion);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Pengaduan (Complaint) - Kontrol
  await testAPI('PENGADUAN (KONTROL)', testData.complaint);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Semua test selesai!');
  console.log(`${'='.repeat(60)}\n`);
}

runTests();
