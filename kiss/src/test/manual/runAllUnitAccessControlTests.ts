/**
 * Unit-Based Access Control - Test Runner
 * 
 * Script ini menjalankan semua tests untuk unit-based access control.
 * 
 * Cara menggunakan:
 * 1. Import script ini di console browser atau Node.js
 * 2. Call runAllTests()
 * 3. Lihat hasil testing di console
 */

import { runBackendTests } from './unitAccessControlBackendTest';
import { runIntegrationTests } from './unitAccessControlIntegrationTest';
import { runPerformanceTests } from './unitAccessControlPerformanceTest';
import { runEdgeCaseTests } from './unitAccessControlEdgeCasesTest';
import { printFrontendTestInstructions } from './unitAccessControlFrontendTest';

/**
 * Run all automated tests
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 Memulai Semua Tests untuk Unit-Based Access Control\n');
  console.log('='.repeat(80));
  console.log('\n');

  try {
    // 1. Backend Tests
    console.log('📦 PHASE 1: Backend Testing');
    console.log('='.repeat(80));
    await runBackendTests();
    console.log('\n');

    // 2. Integration Tests
    console.log('🔗 PHASE 2: Integration Testing');
    console.log('='.repeat(80));
    await runIntegrationTests();
    console.log('\n');

    // 3. Performance Tests
    console.log('⚡ PHASE 3: Performance Testing');
    console.log('='.repeat(80));
    await runPerformanceTests();
    console.log('\n');

    // 4. Edge Case Tests
    console.log('🔍 PHASE 4: Edge Case Testing');
    console.log('='.repeat(80));
    await runEdgeCaseTests();
    console.log('\n');

    // 5. Frontend Tests (Manual)
    console.log('🖥️  PHASE 5: Frontend Testing (Manual)');
    console.log('='.repeat(80));
    console.log('Frontend testing memerlukan interaksi UI manual.');
    console.log('Silakan jalankan: printFrontendTestInstructions()');
    console.log('\n');

    // Final Summary
    console.log('='.repeat(80));
    console.log('✅ SEMUA AUTOMATED TESTS SELESAI');
    console.log('='.repeat(80));
    console.log('\nCatatan:');
    console.log('- Backend, Integration, Performance, dan Edge Case tests sudah selesai');
    console.log('- Frontend tests memerlukan manual testing');
    console.log('- Jalankan printFrontendTestInstructions() untuk panduan frontend testing');
    console.log('\n');

  } catch (error: any) {
    console.error('❌ Error saat menjalankan tests:', error.message);
    console.error(error);
  }
}

/**
 * Run specific test suite
 */
export async function runSpecificTest(testSuite: 'backend' | 'integration' | 'performance' | 'edge-case' | 'frontend'): Promise<void> {
  console.log(`🧪 Menjalankan ${testSuite} tests...\n`);

  switch (testSuite) {
    case 'backend':
      await runBackendTests();
      break;
    case 'integration':
      await runIntegrationTests();
      break;
    case 'performance':
      await runPerformanceTests();
      break;
    case 'edge-case':
      await runEdgeCaseTests();
      break;
    case 'frontend':
      printFrontendTestInstructions();
      break;
    default:
      console.error('❌ Test suite tidak dikenal:', testSuite);
  }
}

/**
 * Quick test - run only critical tests
 */
export async function runQuickTest(): Promise<void> {
  console.log('⚡ Menjalankan Quick Tests (Backend + Integration)...\n');
  
  await runBackendTests();
  console.log('\n');
  await runIntegrationTests();
  
  console.log('\n✅ Quick tests selesai!');
  console.log('Untuk full testing, jalankan: runAllTests()');
}

// Export individual test runners
export {
  runBackendTests,
  runIntegrationTests,
  runPerformanceTests,
  runEdgeCaseTests,
  printFrontendTestInstructions,
};

// Auto-run jika dipanggil langsung
if (typeof window !== 'undefined') {
  (window as any).runAllUnitAccessControlTests = runAllTests;
  (window as any).runSpecificUnitAccessControlTest = runSpecificTest;
  (window as any).runQuickUnitAccessControlTest = runQuickTest;
  (window as any).printFrontendTestInstructions = printFrontendTestInstructions;
  
  console.log('✅ Unit Access Control Test Runner loaded!');
  console.log('Available commands:');
  console.log('  - runAllUnitAccessControlTests()');
  console.log('  - runSpecificUnitAccessControlTest("backend"|"integration"|"performance"|"edge-case"|"frontend")');
  console.log('  - runQuickUnitAccessControlTest()');
  console.log('  - printFrontendTestInstructions()');
}
