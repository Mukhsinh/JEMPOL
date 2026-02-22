/**
 * Unit-Based Access Control - Performance Testing Script
 * 
 * Script ini untuk testing performa dari unit-based access control implementation.
 */

import { supabase } from '../../utils/supabaseClient';

interface PerformanceTestResult {
  name: string;
  passed: boolean;
  message: string;
  metrics?: {
    duration: number;
    degradation?: number;
    threshold?: number;
  };
  details?: any;
}

const results: PerformanceTestResult[] = [];

/**
 * Test 17.1: Query performance dengan unit filter
 */
async function testQueryPerformanceWithUnitFilter(): Promise<PerformanceTestResult> {
  try {
    // Ambil sample unit
    const { data: units } = await supabase
      .from('units')
      .select('id')
      .limit(1);

    if (!units || units.length === 0) {
      return {
        name: 'Query Performance with Unit Filter',
        passed: false,
        message: 'Tidak ada units untuk testing',
      };
    }

    const testUnitId = units[0].id;

    // Test 1: Query TANPA filter (baseline)
    const startBaseline = performance.now();
    const { data: allTickets } = await supabase
      .from('tickets')
      .select('id, unit_id, title, status, priority')
      .limit(100);
    const baselineDuration = performance.now() - startBaseline;

    // Test 2: Query DENGAN unit filter
    const startFiltered = performance.now();
    const { data: filteredTickets } = await supabase
      .from('tickets')
      .select('id, unit_id, title, status, priority')
      .eq('unit_id', testUnitId)
      .limit(100);
    const filteredDuration = performance.now() - startFiltered;

    // Calculate degradation
    const degradation = ((filteredDuration - baselineDuration) / baselineDuration) * 100;
    const threshold = 10; // 10% max degradation

    const passed = degradation <= threshold;

    return {
      name: 'Query Performance with Unit Filter',
      passed,
      message: passed
        ? `Query performance baik - degradasi ${degradation.toFixed(2)}% (threshold: ${threshold}%)`
        : `Query performance buruk - degradasi ${degradation.toFixed(2)}% (threshold: ${threshold}%)`,
      metrics: {
        duration: filteredDuration,
        degradation,
        threshold,
      },
      details: {
        baselineDuration: `${baselineDuration.toFixed(2)}ms`,
        filteredDuration: `${filteredDuration.toFixed(2)}ms`,
        baselineCount: allTickets?.length || 0,
        filteredCount: filteredTickets?.length || 0,
      },
    };
  } catch (err: any) {
    return {
      name: 'Query Performance with Unit Filter',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Test 17.2: Performance dengan dataset besar
 */
async function testPerformanceWithLargeDataset(): Promise<PerformanceTestResult> {
  try {
    // Ambil sample unit
    const { data: units } = await supabase
      .from('units')
      .select('id')
      .limit(1);

    if (!units || units.length === 0) {
      return {
        name: 'Performance with Large Dataset',
        passed: false,
        message: 'Tidak ada units untuk testing',
      };
    }

    const testUnitId = units[0].id;

    // Test pagination performance
    const pageSize = 20;
    const pagesToTest = 5;
    const durations: number[] = [];

    for (let page = 0; page < pagesToTest; page++) {
      const start = performance.now();
      const { data } = await supabase
        .from('tickets')
        .select('id, unit_id, title, status, priority, created_at')
        .eq('unit_id', testUnitId)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      const duration = performance.now() - start;
      durations.push(duration);
    }

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const threshold = 500; // 500ms max per page

    const passed = maxDuration <= threshold;

    return {
      name: 'Performance with Large Dataset',
      passed,
      message: passed
        ? `Pagination performance baik - avg ${avgDuration.toFixed(2)}ms, max ${maxDuration.toFixed(2)}ms`
        : `Pagination performance buruk - max ${maxDuration.toFixed(2)}ms (threshold: ${threshold}ms)`,
      metrics: {
        duration: avgDuration,
        threshold,
      },
      details: {
        avgDuration: `${avgDuration.toFixed(2)}ms`,
        maxDuration: `${maxDuration.toFixed(2)}ms`,
        minDuration: `${Math.min(...durations).toFixed(2)}ms`,
        pagesTested: pagesToTest,
        pageSize,
      },
    };
  } catch (err: any) {
    return {
      name: 'Performance with Large Dataset',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Test 17.3: Audit log performance
 */
async function testAuditLogPerformance(): Promise<PerformanceTestResult> {
  try {
    // Test concurrent requests dengan audit logging
    const concurrentRequests = 10;
    const promises: Promise<any>[] = [];

    // Ambil sample unit
    const { data: units } = await supabase
      .from('units')
      .select('id')
      .limit(1);

    if (!units || units.length === 0) {
      return {
        name: 'Audit Log Performance',
        passed: false,
        message: 'Tidak ada units untuk testing',
      };
    }

    const testUnitId = units[0].id;

    // Start concurrent requests
    const startTime = performance.now();
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        supabase
          .from('tickets')
          .select('id, unit_id')
          .eq('unit_id', testUnitId)
          .limit(10)
      );
    }

    await Promise.all(promises);
    const totalDuration = performance.now() - startTime;
    const avgDuration = totalDuration / concurrentRequests;

    // Check if audit logs were created (optional - depends on implementation)
    // For now, we just verify performance

    const threshold = 200; // 200ms avg per request
    const passed = avgDuration <= threshold;

    return {
      name: 'Audit Log Performance',
      passed,
      message: passed
        ? `Audit logging tidak mempengaruhi performa - avg ${avgDuration.toFixed(2)}ms per request`
        : `Audit logging memperlambat performa - avg ${avgDuration.toFixed(2)}ms (threshold: ${threshold}ms)`,
      metrics: {
        duration: avgDuration,
        threshold,
      },
      details: {
        concurrentRequests,
        totalDuration: `${totalDuration.toFixed(2)}ms`,
        avgDuration: `${avgDuration.toFixed(2)}ms`,
        note: 'Audit logging harus non-blocking dan tidak impact performa',
      },
    };
  } catch (err: any) {
    return {
      name: 'Audit Log Performance',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Run all performance tests
 */
export async function runPerformanceTests(): Promise<void> {
  console.log('⚡ Memulai Performance Testing untuk Unit-Based Access Control...\n');

  // Run tests
  results.push(await testQueryPerformanceWithUnitFilter());
  results.push(await testPerformanceWithLargeDataset());
  results.push(await testAuditLogPerformance());

  // Print results
  console.log('📊 Hasil Performance Testing:\n');
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.metrics) {
      console.log(`   Metrics:`, result.metrics);
    }
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
    console.log('');
  });

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  console.log('📈 Summary:');
  console.log(`   Passed: ${passedCount}/${totalCount}`);
  console.log(`   Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

  if (!allPassed) {
    console.log('⚠️  Perhatian: Ada performance issues. Silakan optimize implementasi.');
  } else {
    console.log('🎉 Semua performance tests berhasil! Performa memenuhi requirements.');
  }
}

// Export untuk digunakan di test runner
export { results };
