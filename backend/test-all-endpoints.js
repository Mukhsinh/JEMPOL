/**
 * Test All API Endpoints
 * Script untuk test semua endpoint API
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

console.log('🧪 Testing API Endpoints...');
console.log('API URL:', API_URL);
console.log('='.repeat(50));

// Test results
const results = {
  passed: [],
  failed: [],
};

// Helper function to test endpoint
async function testEndpoint(name, method, url, data = null) {
  try {
    console.log(`\n📍 Testing: ${name}`);
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    
    let response;
    if (method === 'GET') {
      response = await axios.get(url);
    } else if (method === 'POST') {
      response = await axios.post(url, data);
    }
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    
    results.passed.push(name);
    return response.data;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response:`, error.response.data);
    }
    results.failed.push({ name, error: error.message });
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('\n🏥 1. HEALTH CHECK');
  console.log('-'.repeat(50));
  await testEndpoint('Health Check', 'GET', `${API_URL}/health`);
  
  console.log('\n\n👥 2. VISITOR ENDPOINTS');
  console.log('-'.repeat(50));
  
  // Test visitor registration
  const visitorData = {
    nama: 'Test User ' + Date.now(),
    instansi: 'Test Hospital',
    jabatan: 'Dokter',
    no_handphone: '081234567890',
  };
  
  const visitor = await testEndpoint(
    'Register Visitor',
    'POST',
    `${API_URL}/visitors`,
    visitorData
  );
  
  // Get all visitors
  await testEndpoint('Get All Visitors', 'GET', `${API_URL}/visitors`);
  
  // Get visitor stats
  await testEndpoint('Get Visitor Stats', 'GET', `${API_URL}/visitors/stats`);
  
  console.log('\n\n🎮 3. GAME ENDPOINTS');
  console.log('-'.repeat(50));
  
  // Test game score submission
  const gameData = {
    player_name: 'Test Player ' + Date.now(),
    score: 1000,
    mode: 'single',
    level: 5,
    duration: 120,
    device_type: 'desktop',
  };
  
  await testEndpoint(
    'Submit Game Score',
    'POST',
    `${API_URL}/game/score`,
    gameData
  );
  
  // Get leaderboard
  await testEndpoint('Get Leaderboard', 'GET', `${API_URL}/game/leaderboard`);
  
  // Get leaderboard with mode filter
  await testEndpoint(
    'Get Leaderboard (Single Mode)',
    'GET',
    `${API_URL}/game/leaderboard?mode=single&limit=5`
  );
  
  console.log('\n\n📚 4. INNOVATION ENDPOINTS');
  console.log('-'.repeat(50));
  
  // Get all innovations
  await testEndpoint('Get All Innovations', 'GET', `${API_URL}/innovations`);
  
  // Get innovations by type
  await testEndpoint(
    'Get Innovations (Photos)',
    'GET',
    `${API_URL}/innovations?type=photo`
  );
  
  await testEndpoint(
    'Get Innovations (Videos)',
    'GET',
    `${API_URL}/innovations?type=video`
  );
  
  await testEndpoint(
    'Get Innovations (PowerPoint)',
    'GET',
    `${API_URL}/innovations?type=powerpoint`
  );
  
  // Print summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
