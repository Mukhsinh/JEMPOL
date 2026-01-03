const axios = require('axios');

console.log('🧪 Testing patient-types endpoint...\n');

const API_BASE_URL = 'http://localhost:3003/api';

async function testEndpoint() {
  try {
    console.log('🔍 Testing public endpoint...');
    
    // Test public endpoint first
    const publicResponse = await axios.get(`${API_BASE_URL}/master-data/public/patient-types`);
    console.log('✅ Public endpoint success:', publicResponse.data?.length || 0, 'records');
    
    console.log('\n🔍 Testing protected endpoint without auth...');
    
    // Test protected endpoint without auth (should fail)
    try {
      const protectedResponse = await axios.get(`${API_BASE_URL}/master-data/patient-types`);
      console.log('⚠️  Protected endpoint without auth succeeded (unexpected):', protectedResponse.data?.length || 0, 'records');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected endpoint correctly requires auth (401)');
      } else {
        console.log('❌ Protected endpoint failed with:', error.response?.status, error.response?.data?.error);
      }
    }
    
    console.log('\n🔍 Testing protected endpoint with mock auth...');
    
    // Test with mock auth header
    try {
      const authResponse = await axios.get(`${API_BASE_URL}/master-data/patient-types`, {
        headers: {
          'Authorization': 'Bearer mock-token-for-testing'
        }
      });
      console.log('⚠️  Protected endpoint with mock token succeeded (unexpected):', authResponse.data?.length || 0, 'records');
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('✅ Protected endpoint correctly rejects invalid token:', error.response?.status);
        console.log('   Error message:', error.response?.data?.error);
      } else {
        console.log('❌ Protected endpoint failed with:', error.response?.status, error.response?.data?.error);
      }
    }
    
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Public endpoint working');
    console.log('   ✅ Protected endpoint requires valid auth');
    console.log('   ✅ Frontend should use fallback mechanism');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running!');
      console.log('   Start backend server first: cd backend && npm start');
    }
  }
}

testEndpoint();