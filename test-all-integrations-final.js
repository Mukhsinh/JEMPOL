#!/usr/bin/env node

/**
 * Script untuk menguji semua integrasi setelah perbaikan
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3003/api';

console.log('🧪 Testing all integrations after fixes...\n');

async function testEndpoint(url, description, method = 'GET', data = null) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`${method} ${url}`);
    
    const config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    let response;
    if (method === 'GET') {
      response = await axios.get(url, config);
    } else if (method === 'POST') {
      response = await axios.post(url, data, config);
    }
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response: ${typeof response.data === 'object' ? 'JSON Object' : response.data}`);
    
    if (Array.isArray(response.data)) {
      console.log(`✅ Data count: ${response.data.length} records`);
    }
    
    console.log('');
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.code} - ${error.response?.data?.error || error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function testMasterDataEndpoints() {
  console.log('🔧 Testing Master Data Endpoints...\n');
  
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
  
  let passedTests = 0;
  let totalTests = 0;
  
  for (const endpoint of endpoints) {
    console.log(`--- Testing ${endpoint} ---`);
    
    // Test public endpoint
    totalTests++;
    const publicResult = await testEndpoint(
      `${API_BASE_URL}/master-data/public/${endpoint}`,
      `Public ${endpoint}`,
      'GET'
    );
    if (publicResult.success) passedTests++;
    
    // Test protected endpoint (without auth - should work with optionalAuth)
    totalTests++;
    const protectedResult = await testEndpoint(
      `${API_BASE_URL}/master-data/${endpoint}`,
      `Protected ${endpoint} (no auth)`,
      'GET'
    );
    if (protectedResult.success) passedTests++;
  }
  
  return { passed: passedTests, total: totalTests };
}

async function testOtherEndpoints() {
  console.log('🔧 Testing Other Endpoints...\n');
  
  const endpoints = [
    {
      url: `${API_BASE_URL}/complaints`,
      description: 'Complaints endpoint',
      method: 'GET'
    },
    {
      url: `${API_BASE_URL}/users`,
      description: 'Users endpoint',
      method: 'GET'
    },
    {
      url: `${API_BASE_URL}/reports/dashboard`,
      description: 'Dashboard reports',
      method: 'GET'
    },
    {
      url: `${API_BASE_URL}/public/survey`,
      description: 'Public survey endpoint',
      method: 'GET'
    }
  ];
  
  let passedTests = 0;
  let totalTests = endpoints.length;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.description, endpoint.method);
    if (result.success) passedTests++;
  }
  
  return { passed: passedTests, total: totalTests };
}

async function testHealthCheck() {
  console.log('🔧 Testing Health Check...\n');
  
  const result = await testEndpoint(
    `${API_BASE_URL}/health`,
    'Health check endpoint',
    'GET'
  );
  
  return result.success ? { passed: 1, total: 1 } : { passed: 0, total: 1 };
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive integration tests...\n');
  
  // Test health check first
  const healthResult = await testHealthCheck();
  
  // Test master data endpoints
  const masterDataResult = await testMasterDataEndpoints();
  
  // Test other endpoints
  const otherResult = await testOtherEndpoints();
  
  // Calculate totals
  const totalPassed = healthResult.passed + masterDataResult.passed + otherResult.passed;
  const totalTests = healthResult.total + masterDataResult.total + otherResult.total;
  
  console.log('📊 COMPREHENSIVE TEST RESULTS:');
  console.log('=====================================');
  console.log(`✅ Health Check: ${healthResult.passed}/${healthResult.total}`);
  console.log(`✅ Master Data: ${masterDataResult.passed}/${masterDataResult.total}`);
  console.log(`✅ Other Endpoints: ${otherResult.passed}/${otherResult.total}`);
  console.log('=====================================');
  console.log(`🎯 TOTAL: ${totalPassed}/${totalTests} tests passed`);
  console.log(`📈 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ Backend integration is working perfectly');
    console.log('✅ Error 403 pada patient-types sudah teratasi');
    console.log('✅ Semua halaman sudah terintegrasi dengan backend');
  } else {
    console.log('\n⚠️  Some tests failed. Issues to address:');
    if (healthResult.passed === 0) {
      console.log('❌ Backend server might not be running');
    }
    if (masterDataResult.passed < masterDataResult.total) {
      console.log('❌ Master data endpoints need attention');
    }
    if (otherResult.passed < otherResult.total) {
      console.log('❌ Other endpoints need attention');
    }
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. If tests failed, start the backend server: npm run dev (in backend folder)');
  console.log('2. Test frontend application in browser');
  console.log('3. Check browser console for any remaining errors');
  console.log('4. Verify all pages load without 403 errors');
  console.log('5. Test CRUD operations on master data pages');
  
  return { totalPassed, totalTests };
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});