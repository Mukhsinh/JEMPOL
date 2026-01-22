// Script untuk test API serverless functions secara lokal
// Jalankan: node test-vercel-api-local.js

const testExternalTicket = {
  reporter_identity_type: 'personal',
  reporter_name: 'Test User',
  reporter_email: 'test@example.com',
  reporter_phone: '081234567890',
  reporter_address: 'Jl. Test No. 123',
  age_range: '26-35',
  service_type: 'complaint',
  category: 'it_support',
  title: 'Test Tiket dari Vercel API',
  description: 'Ini adalah test tiket untuk memastikan API berfungsi di Vercel',
  unit_id: 'GANTI_DENGAN_UNIT_ID_VALID', // Ganti dengan unit_id yang valid dari database
  source: 'web'
};

const testSurvey = {
  unit_id: 'GANTI_DENGAN_UNIT_ID_VALID', // Ganti dengan unit_id yang valid dari database
  service_type: 'complaint',
  visitor_phone: '081234567890',
  visitor_name: 'Test User',
  visitor_email: 'test@example.com',
  is_anonymous: false,
  age_range: '26-35',
  gender: 'male',
  q1_score: 4,
  q2_score: 5,
  q3_score: 4,
  q4_score: 5,
  q5_score: 4,
  q6_score: 5,
  q7_score: 4,
  q8_score: 5,
  overall_score: 4,
  comments: 'Test survei dari Vercel API',
  source: 'public_survey'
};

console.log('📋 Test Data untuk External Ticket:');
console.log(JSON.stringify(testExternalTicket, null, 2));
console.log('\n📋 Test Data untuk Survey:');
console.log(JSON.stringify(testSurvey, null, 2));
console.log('\n✅ Setelah deploy ke Vercel, test dengan:');
console.log('1. Buka form tiket eksternal di browser');
console.log('2. Isi form dan submit');
console.log('3. Periksa Network tab di DevTools untuk melihat response');
console.log('4. Jika error, periksa Vercel Logs di Dashboard');
