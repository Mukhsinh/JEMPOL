#!/usr/bin/env node

/**
 * Script untuk menguji integrasi patient-types setelah perbaikan
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3003/api';

console.log('🧪 Testing patient-types integration after fixes...\n');

async function testEndpoint(url, description, withAuth = false) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (withAuth) {
      // Add a dummy token for auth testing
      config.headers.Authorization = 'Bearer dummy-token-for-testing';
    }
    
    const response = await axios.get(url, config);
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Data count: ${response.data?.length || 0} records`);
    
    if (response.data && response.data.length > 0) {
      console.log(`✅ Sample data:`, JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.code} - ${error.response?.data?.error || error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('🔧 Testing patient-types endpoints...\n');
  
  const tests = [
    {
      url: `${API_BASE_URL}/master-data/public/patient-types`,
      description: 'Public patient-types endpoint (no auth)',
      withAuth: false
    },
    {
      url: `${API_BASE_URL}/master-data/patient-types`,
      description: 'Protected patient-types endpoint (with optional auth)',
      withAuth: false
    },
    {
      url: `${API_BASE_URL}/master-data/patient-types`,
      description: 'Protected patient-types endpoint (with dummy auth)',
      withAuth: true
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description, test.withAuth);
    if (result) passedTests++;
  }
  
  console.log('📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passedTests}/${tests.length} tests`);
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length} tests`);
  
  if (passedTests === tests.length) {
    console.log('\n🎉 All tests passed! Patient-types integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend server and configuration.');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('1. Start the backend server if not running');
  console.log('2. Test the frontend application');
  console.log('3. Check browser console for any remaining errors');
  console.log('4. Verify all master data pages are working');
}

// Test other master data endpoints
async function testAllMasterDataEndpoints() {
  console.log('\n🧪 Testing all master data endpoints...\n');
  
  const endpoints = [
    'unit-types',
    'service-categories', 
    'ticket-types',
    'ticket-classifications',
    'ticket-statuses',
    'patient-types',
    'roles',
    'sla-settings'
  ];
  
  let totalPassed = 0;
  
  for (const endpoint of endpoints) {
    console.log(`\n--- Testing ${endpoint} ---`);
    
    const publicResult = await testEndpoint(
      `${API_BASE_URL}/master-data/public/${endpoint}`,
      `Public ${endpoint}`,
      false
    );
    
    const protectedResult = await testEndpoint(
      `${API_BASE_URL}/master-data/${endpoint}`,
      `Protected ${endpoint}`,
      false
    );
    
    if (publicResult && protectedResult) {
      totalPassed++;
    }
  }
  
  console.log(`\n📊 MASTER DATA ENDPOINTS SUMMARY:`);
  console.log(`✅ Working endpoints: ${totalPassed}/${endpoints.length}`);
  console.log(`❌ Failed endpoints: ${endpoints.length - totalPassed}/${endpoints.length}`);
}

// Run all tests
runTests().then(() => {
  return testAllMasterDataEndpoints();
}).catch(error => {
  console.error('Test execution failed:', error);
});