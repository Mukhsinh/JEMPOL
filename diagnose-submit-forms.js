/**
 * Script untuk mendiagnosa masalah submit form
 * Menguji koneksi ke API dan validasi response
 */

const API_BASE = 'http://localhost:3000/api';

async function testEndpoint(name, url, payload) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${name}`);
  console.log(`📍 URL: ${url}`);
  console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
  console.log(`${'='.repeat(60)}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Headers:`, Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    console.log(`📥 Content-Type: ${contentType}`);

    const text = await response.text();
    console.log(`📥 Response Text (first 500 chars):`);
    console.log(text.substring(0, 500));

    let data;
    try {
      data = JSON.parse(text);
      console.log(`✅ Response is valid JSON`);
      console.log(`📊 Parsed Data:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`❌ Response is NOT valid JSON!`);
      console.error(`❌ Parse error:`, e.message);
      console.log(`📄 Full response text:`);
      console.log(text);
      return { success: false, error: 'Invalid JSON response', text };
    }

    if (data.success) {
      console.log(`✅ SUCCESS: ${name}`);
      if (data.ticket_number) {
        console.log(`🎫 Ticket Number: ${data.ticket_number}`);
      }
      return { success: true, data };
    } else {
      console.error(`❌ FAILED: ${data.error || 'Unknown error'}`);
      if (data.details) {
        console.error(`📋 Details:`, data.details);
      }
      return { success: false, error: data.error, details: data.details };
    }
  } catch (error) {
    console.error(`❌ EXCEPTION: ${error.message}`);
    console.error(`📋 Stack:`, error.stack);
    return { success: false, error: error.message };
  }
}

async function getFirstUnit() {
  try {
    console.log(`\n🔍 Fetching first active unit...`);
    const response = await fetch(`${API_BASE}/public/units`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const unit = data.data[0];
      console.log(`✅ Found unit: ${unit.name} (${unit.id})`);
      return unit.id;
    } else {
      console.error(`❌ No units found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching units:`, error.message);
    return null;
  }
}

async function runDiagnostics() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         🔬 DIAGNOSA SUBMIT FORM - KISS                     ║
║         Testing API Endpoints                              ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Get unit ID first
  const unitId = await getFirstUnit();
  if (!unitId) {
    console.error(`\n❌ Cannot proceed without unit ID`);
    return;
  }

  const results = {
    internal: null,
    external: null,
    survey: null
  };

  // Test 1: Internal Ticket
  results.internal = await testEndpoint(
    'Internal Ticket',
    `${API_BASE}/public/internal-tickets`,
    {
      reporter_name: 'Test Internal User',
      reporter_email: 'internal@test.com',
      reporter_phone: '081234567890',
      unit_id: unitId,
      title: 'Test Tiket Internal - Diagnostic',
      description: 'Ini adalah test diagnostic untuk tiket internal',
      priority: 'medium',
      source: 'web'
    }
  );

  // Test 2: External Ticket
  results.external = await testEndpoint(
    'External Ticket',
    `${API_BASE}/public/external-tickets`,
    {
      reporter_identity_type: 'known',
      reporter_name: 'Test External User',
      reporter_email: 'external@test.com',
      reporter_phone: '081234567891',
      unit_id: unitId,
      service_type: 'complaint',
      title: 'Test Tiket Eksternal - Diagnostic',
      description: 'Ini adalah test diagnostic untuk tiket eksternal',
      source: 'web'
    }
  );

  // Test 3: Survey
  results.survey = await testEndpoint(
    'Survey',
    `${API_BASE}/public/surveys`,
    {
      unit_id: unitId,
      visitor_name: 'Test Survey User',
      visitor_email: 'survey@test.com',
      visitor_phone: '081234567892',
      is_anonymous: false,
      q1_score: 4,
      q2_score: 4,
      q3_score: 4,
      q4_score: 4,
      q5_score: 4,
      q6_score: 4,
      q7_score: 4,
      q8_score: 4,
      overall_score: 4,
      comments: 'Test survey diagnostic',
      source: 'public_survey'
    }
  );

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SUMMARY HASIL TEST`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Internal Ticket: ${results.internal?.success ? '✅ BERHASIL' : '❌ GAGAL'}`);
  console.log(`External Ticket: ${results.external?.success ? '✅ BERHASIL' : '❌ GAGAL'}`);
  console.log(`Survey:          ${results.survey?.success ? '✅ BERHASIL' : '❌ GAGAL'}`);
  console.log(`${'='.repeat(60)}`);

  const allSuccess = results.internal?.success && results.external?.success && results.survey?.success;
  
  if (allSuccess) {
    console.log(`\n🎉 SEMUA TEST BERHASIL!`);
  } else {
    console.log(`\n⚠️ ADA TEST YANG GAGAL - Lihat detail di atas`);
  }

  return results;
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error(`\n❌ Fatal error:`, error);
  process.exit(1);
});
