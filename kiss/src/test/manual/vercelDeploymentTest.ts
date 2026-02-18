/**
 * Manual Deployment Testing Script
 * Untuk testing routes di Vercel preview/production environment
 * 
 * Usage:
 * 1. Update VERCEL_URL dengan URL deployment Anda
 * 2. Run: npx tsx kiss/src/test/manual/vercelDeploymentTest.ts
 */

import {
  testDirectAccess,
  testPageRefresh,
  testApiEndpoint,
  testStaticAsset,
  testMultipleRoutes,
  verifyAllRoutesSuccessful,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  API_ENDPOINTS,
} from '../utils/routeTestHelpers';

// UPDATE INI DENGAN URL VERCEL ANDA
const VERCEL_URL = process.env.VERCEL_URL || 'https://your-app.vercel.app';

interface TestSection {
  name: string;
  passed: number;
  failed: number;
  details: string[];
}

const testResults: TestSection[] = [];

async function runTests() {
  console.log('🚀 Starting Vercel Deployment Tests...');
  console.log(`📍 Testing URL: ${VERCEL_URL}\n`);

  // Test 6.2: Public Routes
  console.log('📋 Test 6.2: Testing Public Routes...');
  const publicSection: TestSection = {
    name: 'Public Routes',
    passed: 0,
    failed: 0,
    details: [],
  };

  for (const route of PUBLIC_ROUTES) {
    // Test direct access
    const directResult = await testDirectAccess(VERCEL_URL, route);
    if (directResult.success) {
      publicSection.passed++;
      publicSection.details.push(`✅ ${route} - Direct access OK (${directResult.statusCode})`);
    } else {
      publicSection.failed++;
      publicSection.details.push(
        `❌ ${route} - Direct access FAILED (${directResult.statusCode || 'N/A'}) - ${directResult.error || 'Unknown error'}`
      );
    }

    // Test refresh
    const refreshResult = await testPageRefresh(VERCEL_URL, route);
    if (refreshResult.success) {
      publicSection.passed++;
      publicSection.details.push(`✅ ${route} - Refresh OK (${refreshResult.statusCode})`);
    } else {
      publicSection.failed++;
      publicSection.details.push(
        `❌ ${route} - Refresh FAILED (${refreshResult.statusCode || 'N/A'}) - ${refreshResult.error || 'Unknown error'}`
      );
    }
  }

  testResults.push(publicSection);
  console.log(`✓ Public Routes: ${publicSection.passed} passed, ${publicSection.failed} failed\n`);

  // Test 6.3: Protected Routes (tanpa auth, expect redirect atau 401)
  console.log('📋 Test 6.3: Testing Protected Routes...');
  const protectedSection: TestSection = {
    name: 'Protected Routes (without auth)',
    passed: 0,
    failed: 0,
    details: [],
  };

  for (const route of PROTECTED_ROUTES) {
    // Test direct access
    const directResult = await testDirectAccess(VERCEL_URL, route);
    // Protected routes should return 200 (with redirect handled by React) or 401/403
    const isExpectedStatus = 
      directResult.statusCode === 200 || 
      directResult.statusCode === 401 || 
      directResult.statusCode === 403;
    
    if (isExpectedStatus) {
      protectedSection.passed++;
      protectedSection.details.push(
        `✅ ${route} - Direct access OK (${directResult.statusCode}) - Returns HTML for client-side auth`
      );
    } else {
      protectedSection.failed++;
      protectedSection.details.push(
        `❌ ${route} - Direct access FAILED (${directResult.statusCode || 'N/A'}) - ${directResult.error || 'Unexpected status'}`
      );
    }

    // Test refresh
    const refreshResult = await testPageRefresh(VERCEL_URL, route);
    const isRefreshExpected = 
      refreshResult.statusCode === 200 || 
      refreshResult.statusCode === 401 || 
      refreshResult.statusCode === 403;
    
    if (isRefreshExpected) {
      protectedSection.passed++;
      protectedSection.details.push(`✅ ${route} - Refresh OK (${refreshResult.statusCode})`);
    } else {
      protectedSection.failed++;
      protectedSection.details.push(
        `❌ ${route} - Refresh FAILED (${refreshResult.statusCode || 'N/A'}) - ${refreshResult.error || 'Unexpected status'}`
      );
    }
  }

  testResults.push(protectedSection);
  console.log(`✓ Protected Routes: ${protectedSection.passed} passed, ${protectedSection.failed} failed\n`);

  // Test 6.4: Routes dengan Parameters
  console.log('📋 Test 6.4: Testing Routes with Parameters...');
  const paramSection: TestSection = {
    name: 'Routes with Parameters',
    passed: 0,
    failed: 0,
    details: [],
  };

  const paramRoutes = [
    '/tickets/123',
    '/tickets/abc-def',
    '/m/test-qr-code',
  ];

  for (const route of paramRoutes) {
    // Test direct access
    const directResult = await testDirectAccess(VERCEL_URL, route);
    // Should return 200 (HTML) even if resource doesn't exist (SPA handles 404)
    if (directResult.statusCode === 200) {
      paramSection.passed++;
      paramSection.details.push(`✅ ${route} - Direct access OK (${directResult.statusCode})`);
    } else {
      paramSection.failed++;
      paramSection.details.push(
        `❌ ${route} - Direct access FAILED (${directResult.statusCode || 'N/A'}) - ${directResult.error || 'Should return HTML'}`
      );
    }

    // Test refresh
    const refreshResult = await testPageRefresh(VERCEL_URL, route);
    if (refreshResult.statusCode === 200) {
      paramSection.passed++;
      paramSection.details.push(`✅ ${route} - Refresh OK (${refreshResult.statusCode})`);
    } else {
      paramSection.failed++;
      paramSection.details.push(
        `❌ ${route} - Refresh FAILED (${refreshResult.statusCode || 'N/A'}) - ${refreshResult.error || 'Should return HTML'}`
      );
    }
  }

  testResults.push(paramSection);
  console.log(`✓ Param Routes: ${paramSection.passed} passed, ${paramSection.failed} failed\n`);

  // Test 6.5: API Endpoints
  console.log('📋 Test 6.5: Testing API Endpoints...');
  const apiSection: TestSection = {
    name: 'API Endpoints',
    passed: 0,
    failed: 0,
    details: [],
  };

  for (const apiPath of API_ENDPOINTS) {
    const apiResult = await testApiEndpoint(VERCEL_URL, apiPath);
    // API should return JSON, not HTML (even if it's 404 or 401)
    const isValidApiResponse = 
      apiResult.statusCode && 
      apiResult.statusCode >= 200 && 
      apiResult.statusCode < 500 &&
      !apiResult.error?.includes('HTML');
    
    if (isValidApiResponse) {
      apiSection.passed++;
      apiSection.details.push(
        `✅ ${apiPath} - API OK (${apiResult.statusCode}) - Returns JSON, not HTML`
      );
    } else {
      apiSection.failed++;
      apiSection.details.push(
        `❌ ${apiPath} - API FAILED (${apiResult.statusCode || 'N/A'}) - ${apiResult.error || 'Returns HTML instead of JSON'}`
      );
    }
  }

  testResults.push(apiSection);
  console.log(`✓ API Endpoints: ${apiSection.passed} passed, ${apiSection.failed} failed\n`);

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  for (const section of testResults) {
    totalPassed += section.passed;
    totalFailed += section.failed;
    
    console.log(`\n${section.name}:`);
    console.log(`  ✅ Passed: ${section.passed}`);
    console.log(`  ❌ Failed: ${section.failed}`);
    
    if (section.failed > 0) {
      console.log('\n  Failed tests:');
      section.details
        .filter(d => d.startsWith('❌'))
        .forEach(d => console.log(`    ${d}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('='.repeat(60));

  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! SPA routing is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
