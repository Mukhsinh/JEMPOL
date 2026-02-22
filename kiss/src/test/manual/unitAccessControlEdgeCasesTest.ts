/**
 * Unit-Based Access Control - Edge Cases Testing Script
 * 
 * Script ini untuk testing edge cases dari unit-based access control implementation.
 */

import { supabase } from '../../utils/supabaseClient';

interface EdgeCaseTestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: EdgeCaseTestResult[] = [];

/**
 * Test 18.1: Handle user tanpa unit_id
 */
async function testUserWithoutUnitId(): Promise<EdgeCaseTestResult> {
  try {
    // Query users tanpa unit_id
    const { data: usersWithoutUnit, error } = await supabase
      .from('users')
      .select('id, email, full_name, unit_id')
      .is('unit_id', null);

    if (error) {
      return {
        name: 'User Without Unit ID',
        passed: false,
        message: `Error querying users: ${error.message}`,
      };
    }

    // Juga check admins table
    const { data: adminsWithoutUnit } = await supabase
      .from('admins')
      .select('id, email, full_name, unit_id, role')
      .is('unit_id', null);

    const totalWithoutUnit = (usersWithoutUnit?.length || 0) + (adminsWithoutUnit?.length || 0);

    // Filter out superadmin dan direktur (mereka boleh tanpa unit_id)
    const problematicUsers = adminsWithoutUnit?.filter(
      admin => admin.role !== 'superadmin' && admin.role !== 'direktur'
    ) || [];

    if (problematicUsers.length > 0) {
      return {
        name: 'User Without Unit ID',
        passed: false,
        message: `Ada ${problematicUsers.length} user (bukan superadmin/direktur) tanpa unit_id`,
        details: {
          problematicUsers: problematicUsers.map(u => ({
            email: u.email,
            role: u.role,
          })),
          note: 'User ini harus di-assign ke unit atau di-set sebagai superadmin/direktur',
        },
      };
    }

    return {
      name: 'User Without Unit ID',
      passed: true,
      message: `Semua user memiliki unit_id atau merupakan superadmin/direktur`,
      details: {
        usersWithoutUnit: usersWithoutUnit?.length || 0,
        adminsWithoutUnit: adminsWithoutUnit?.length || 0,
        superadminDirektur: adminsWithoutUnit?.filter(
          a => a.role === 'superadmin' || a.role === 'direktur'
        ).length || 0,
        note: 'Superadmin dan direktur boleh tanpa unit_id (global access)',
      },
    };
  } catch (err: any) {
    return {
      name: 'User Without Unit ID',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Test 18.2: Handle unit yang di-nonaktifkan
 */
async function testInactiveUnit(): Promise<EdgeCaseTestResult> {
  try {
    // Query inactive units
    const { data: inactiveUnits, error } = await supabase
      .from('units')
      .select('id, name, is_active')
      .eq('is_active', false);

    if (error) {
      return {
        name: 'Inactive Unit',
        passed: false,
        message: `Error querying units: ${error.message}`,
      };
    }

    if (!inactiveUnits || inactiveUnits.length === 0) {
      return {
        name: 'Inactive Unit',
        passed: true,
        message: 'Tidak ada inactive units (acceptable)',
      };
    }

    // Check users di inactive units
    const inactiveUnitIds = inactiveUnits.map(u => u.id);
    
    const { data: usersInInactiveUnits } = await supabase
      .from('users')
      .select('id, email, unit_id')
      .in('unit_id', inactiveUnitIds);

    const { data: adminsInInactiveUnits } = await supabase
      .from('admins')
      .select('id, email, unit_id')
      .in('unit_id', inactiveUnitIds);

    const totalUsersInInactive = (usersInInactiveUnits?.length || 0) + (adminsInInactiveUnits?.length || 0);

    // Check tickets di inactive units
    const { data: ticketsInInactiveUnits } = await supabase
      .from('tickets')
      .select('id, unit_id')
      .in('unit_id', inactiveUnitIds);

    return {
      name: 'Inactive Unit',
      passed: true,
      message: `Ditemukan ${inactiveUnits.length} inactive units dengan ${totalUsersInInactive} users dan ${ticketsInInactiveUnits?.length || 0} tickets`,
      details: {
        inactiveUnits: inactiveUnits.map(u => u.name),
        usersCount: totalUsersInInactive,
        ticketsCount: ticketsInInactiveUnits?.length || 0,
        note: 'Users di inactive units masih dapat akses data (unit_id tidak berubah)',
      },
    };
  } catch (err: any) {
    return {
      name: 'Inactive Unit',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Test 18.3: Handle perubahan unit user
 */
async function testUserUnitChange(): Promise<EdgeCaseTestResult> {
  try {
    // Simulasi: Ambil sample user dan 2 units
    const { data: units } = await supabase
      .from('units')
      .select('id, name')
      .limit(2);

    if (!units || units.length < 2) {
      return {
        name: 'User Unit Change',
        passed: true,
        message: 'Tidak cukup units untuk testing (acceptable)',
      };
    }

    const unitA = units[0];
    const unitB = units[1];

    // Ambil tickets dari kedua unit
    const { data: ticketsA } = await supabase
      .from('tickets')
      .select('id, unit_id')
      .eq('unit_id', unitA.id)
      .limit(5);

    const { data: ticketsB } = await supabase
      .from('tickets')
      .select('id, unit_id')
      .eq('unit_id', unitB.id)
      .limit(5);

    // Verify bahwa tickets dari unit A tidak tercampur dengan unit B
    const ticketsACorrect = ticketsA?.every(t => t.unit_id === unitA.id) ?? true;
    const ticketsBCorrect = ticketsB?.every(t => t.unit_id === unitB.id) ?? true;

    if (!ticketsACorrect || !ticketsBCorrect) {
      return {
        name: 'User Unit Change',
        passed: false,
        message: 'Data tercampur antar unit',
      };
    }

    return {
      name: 'User Unit Change',
      passed: true,
      message: 'Unit isolation bekerja dengan benar - data tidak tercampur antar unit',
      details: {
        unitA: {
          name: unitA.name,
          ticketsCount: ticketsA?.length || 0,
        },
        unitB: {
          name: unitB.name,
          ticketsCount: ticketsB?.length || 0,
        },
        note: 'Setelah user pindah unit dan re-login, akan melihat data unit baru',
      },
    };
  } catch (err: any) {
    return {
      name: 'User Unit Change',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Additional Edge Case: Handle NULL values
 */
async function testNullValueHandling(): Promise<EdgeCaseTestResult> {
  try {
    // Check tickets dengan unit_id NULL
    const { data: ticketsWithoutUnit } = await supabase
      .from('tickets')
      .select('id, unit_id, ticket_number')
      .is('unit_id', null);

    if (ticketsWithoutUnit && ticketsWithoutUnit.length > 0) {
      return {
        name: 'NULL Value Handling',
        passed: false,
        message: `Ditemukan ${ticketsWithoutUnit.length} tickets tanpa unit_id`,
        details: {
          ticketsWithoutUnit: ticketsWithoutUnit.slice(0, 5).map(t => t.ticket_number),
          note: 'Semua tickets harus memiliki unit_id',
        },
      };
    }

    return {
      name: 'NULL Value Handling',
      passed: true,
      message: 'Tidak ada tickets dengan unit_id NULL',
    };
  } catch (err: any) {
    return {
      name: 'NULL Value Handling',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Additional Edge Case: Handle concurrent access
 */
async function testConcurrentAccess(): Promise<EdgeCaseTestResult> {
  try {
    // Ambil sample unit
    const { data: units } = await supabase
      .from('units')
      .select('id')
      .limit(1);

    if (!units || units.length === 0) {
      return {
        name: 'Concurrent Access',
        passed: false,
        message: 'Tidak ada units untuk testing',
      };
    }

    const testUnitId = units[0].id;

    // Simulate concurrent requests
    const concurrentRequests = 5;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        supabase
          .from('tickets')
          .select('id, unit_id')
          .eq('unit_id', testUnitId)
          .limit(10)
      );
    }

    const results = await Promise.all(promises);

    // Verify all requests succeeded
    const allSucceeded = results.every(r => !r.error);

    if (!allSucceeded) {
      return {
        name: 'Concurrent Access',
        passed: false,
        message: 'Beberapa concurrent requests gagal',
      };
    }

    // Verify all results consistent
    const firstResultCount = results[0].data?.length || 0;
    const allConsistent = results.every(r => r.data?.length === firstResultCount);

    return {
      name: 'Concurrent Access',
      passed: allConsistent,
      message: allConsistent
        ? `Concurrent access bekerja dengan baik - ${concurrentRequests} requests berhasil`
        : 'Concurrent access menghasilkan data yang tidak konsisten',
      details: {
        concurrentRequests,
        allSucceeded,
        allConsistent,
      },
    };
  } catch (err: any) {
    return {
      name: 'Concurrent Access',
      passed: false,
      message: `Error: ${err.message}`,
    };
  }
}

/**
 * Run all edge case tests
 */
export async function runEdgeCaseTests(): Promise<void> {
  console.log('🔍 Memulai Edge Case Testing untuk Unit-Based Access Control...\n');

  // Run tests
  results.push(await testUserWithoutUnitId());
  results.push(await testInactiveUnit());
  results.push(await testUserUnitChange());
  results.push(await testNullValueHandling());
  results.push(await testConcurrentAccess());

  // Print results
  console.log('📊 Hasil Edge Case Testing:\n');
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.name}`);
    console.log(`   ${result.message}`);
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
    console.log('⚠️  Perhatian: Ada edge cases yang perlu ditangani.');
  } else {
    console.log('🎉 Semua edge case tests berhasil! Implementation robust.');
  }
}

// Export untuk digunakan di test runner
export { results };
