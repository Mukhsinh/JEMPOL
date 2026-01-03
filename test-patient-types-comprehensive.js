const axios = require('axios');

console.log('🧪 Comprehensive patient-types endpoint test...');

const API_BASE_URL = 'http://localhost:3003/api';

async function runTests() {
  console.log('\n1. Testing public endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/public/patient-types`);
    console.log('✅ Public endpoint works:', response.data?.length || 0, 'records');
    if (response.data && response.data.length > 0) {
      console.log('   Sample record:', response.data[0]);
    }
  } catch (error) {
    console.error('❌ Public endpoint failed:', error.response?.status, error.response?.data?.error || error.message);
  }

  console.log('\n2. Testing protected endpoint without auth...');
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/patient-types`);
    console.log('⚠️  Protected endpoint works without auth (unexpected):', response.data?.length || 0, 'records');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Protected endpoint correctly requires auth');
    } else {
      console.error('❌ Protected endpoint failed:', error.response?.status, error.response?.data?.error || error.message);
    }
  }

  console.log('\n3. Testing with invalid token...');
  try {
    const response = await axios.get(`${API_BASE_URL}/master-data/patient-types`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    console.log('⚠️  Protected endpoint works with invalid token (unexpected):', response.data?.length || 0, 'records');
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('✅ Protected endpoint correctly rejects invalid token');
    } else {
      console.error('❌ Protected endpoint failed:', error.response?.status, error.response?.data?.error || error.message);
    }
  }

  console.log('\n4. Testing backend server status...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend server is healthy');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running!');
      console.log('   Start with: cd backend && npm start');
    } else {
      console.log('⚠️  Health endpoint not available (normal for some setups)');
    }
  }

  console.log('\n📋 Test Summary:');
  console.log('   - Public endpoint should work');
  console.log('   - Protected endpoint should require valid auth');
  console.log('   - Frontend should use fallback mechanism');
  console.log('   - Error 403 indicates auth token issues');
}

runTests().catch(console.error);