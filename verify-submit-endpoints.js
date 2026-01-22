// Script untuk verifikasi endpoint submit tiket dan survey
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testExternalTicketEndpoint() {
  console.log('\n🔍 Testing External Ticket Endpoint...');
  console.log('='.repeat(50));
  
  try {
    const testData = {
      reporter_identity_type: 'personal',
      reporter_name: 'Test User',
      reporter_email: 'test@example.com',
      reporter_phone: '081234567890',
      service_type: 'complaint',
      title: 'Test Tiket',
      description: 'Ini adalah test tiket eksternal',
      unit_id: 'test-unit-id',
      source: 'web'
    };

    console.log('📤 Mengirim data:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${BASE_URL}/api/public/external-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('📥 Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('📥 Response:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        console.log('✅ External Ticket Endpoint: BERHASIL');
      } else {
        console.log('❌ External Ticket Endpoint: GAGAL');
        console.log('Error:', result.error || result.message);
      }
    } else {
      const text = await response.text();
      console.log('❌ Response bukan JSON:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testSurveyEndpoint() {
  console.log('\n🔍 Testing Survey Endpoint...');
  console.log('='.repeat(50));
  
  try {
    const testData = {
      unit_id: 'test-unit-id',
      visitor_name: 'Test User',
      visitor_phone: '081234567890',
      is_anonymous: false,
      age_range: '20-40 Th',
      gender: 'male',
      u1_ind1_score: 4,
      u1_ind2_score: 4,
      u1_ind3_score: 4,
      overall_score: 4,
      comments: 'Test survey',
      source: 'public_survey'
    };

    console.log('📤 Mengirim data:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${BASE_URL}/api/public/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('📥 Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('📥 Response:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        console.log('✅ Survey Endpoint: BERHASIL');
      } else {
        console.log('❌ Survey Endpoint: GAGAL');
        console.log('Error:', result.error || result.message);
      }
    } else {
      const text = await response.text();
      console.log('❌ Response bukan JSON:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Memulai verifikasi endpoint submit...\n');
  
  await testExternalTicketEndpoint();
  await testSurveyEndpoint();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Verifikasi selesai');
  console.log('='.repeat(50));
}

main().catch(console.error);
