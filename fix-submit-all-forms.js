/**
 * Script untuk memperbaiki semua masalah submit form
 * - Tiket Internal
 * - Tiket Eksternal  
 * - Survey
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixDatabase() {
  console.log('🔍 Memeriksa struktur database...\n');

  // 1. Cek tabel tickets
  console.log('1️⃣ Memeriksa tabel tickets...');
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .limit(1);

  if (ticketsError) {
    console.error('❌ Error pada tabel tickets:', ticketsError.message);
  } else {
    console.log('✅ Tabel tickets OK');
  }

  // 2. Cek tabel public_surveys
  console.log('\n2️⃣ Memeriksa tabel public_surveys...');
  const { data: surveys, error: surveysError } = await supabase
    .from('public_surveys')
    .select('*')
    .limit(1);

  if (surveysError) {
    console.error('❌ Error pada tabel public_surveys:', surveysError.message);
  } else {
    console.log('✅ Tabel public_surveys OK');
  }

  // 3. Cek units aktif
  console.log('\n3️⃣ Memeriksa units aktif...');
  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id, name, code')
    .eq('is_active', true);

  if (unitsError) {
    console.error('❌ Error mengambil units:', unitsError.message);
  } else {
    console.log(`✅ Ditemukan ${units.length} units aktif:`);
    units.forEach(unit => {
      console.log(`   - ${unit.name} (${unit.code})`);
    });
  }

  // 4. Cek service categories aktif
  console.log('\n4️⃣ Memeriksa service categories aktif...');
  const { data: categories, error: categoriesError } = await supabase
    .from('service_categories')
    .select('id, name, code')
    .eq('is_active', true);

  if (categoriesError) {
    console.error('❌ Error mengambil categories:', categoriesError.message);
  } else {
    console.log(`✅ Ditemukan ${categories.length} categories aktif:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.code})`);
    });
  }

  // 5. Cek patient types aktif
  console.log('\n5️⃣ Memeriksa patient types aktif...');
  const { data: patientTypes, error: patientTypesError } = await supabase
    .from('patient_types')
    .select('id, name, code')
    .eq('is_active', true);

  if (patientTypesError) {
    console.error('❌ Error mengambil patient types:', patientTypesError.message);
  } else {
    console.log(`✅ Ditemukan ${patientTypes.length} patient types aktif:`);
    patientTypes.forEach(pt => {
      console.log(`   - ${pt.name} (${pt.code})`);
    });
  }

  // 6. Cek QR codes aktif
  console.log('\n6️⃣ Memeriksa QR codes aktif...');
  const { data: qrCodes, error: qrCodesError } = await supabase
    .from('qr_codes')
    .select('id, name, code, token')
    .eq('is_active', true);

  if (qrCodesError) {
    console.error('❌ Error mengambil QR codes:', qrCodesError.message);
  } else {
    console.log(`✅ Ditemukan ${qrCodes.length} QR codes aktif`);
  }

  return { units, categories, patientTypes, qrCodes };
}

async function testInternalTicketSubmit(units, categories) {
  console.log('\n\n🧪 TEST 1: Submit Tiket Internal');
  console.log('='.repeat(50));

  if (!units || units.length === 0) {
    console.error('❌ Tidak ada unit untuk testing');
    return false;
  }

  const testUnit = units[0];
  const testCategory = categories && categories.length > 0 ? categories[0] : null;

  const ticketData = {
    ticket_number: `INT-TEST-${Date.now()}`,
    type: 'complaint',
    title: 'Test Tiket Internal',
    description: 'Ini adalah test tiket internal untuk memastikan submit berhasil',
    unit_id: testUnit.id,
    category_id: testCategory ? testCategory.id : null,
    priority: 'medium',
    status: 'open',
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    source: 'web',
    is_anonymous: false,
    submitter_name: 'Test User',
    submitter_email: 'test@example.com',
    submitter_phone: '081234567890'
  };

  console.log('📤 Mengirim data:', {
    ticket_number: ticketData.ticket_number,
    type: ticketData.type,
    unit_id: ticketData.unit_id,
    category_id: ticketData.category_id
  });

  const { data, error } = await supabase
    .from('tickets')
    .insert(ticketData)
    .select()
    .single();

  if (error) {
    console.error('❌ GAGAL submit tiket internal:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    console.error('   Error hint:', error.hint);
    return false;
  }

  console.log('✅ BERHASIL submit tiket internal!');
  console.log('   Ticket Number:', data.ticket_number);
  console.log('   Ticket ID:', data.id);

  // Cleanup - hapus test ticket
  await supabase.from('tickets').delete().eq('id', data.id);
  console.log('🧹 Test ticket dihapus');

  return true;
}

async function testExternalTicketSubmit(units, categories, patientTypes) {
  console.log('\n\n🧪 TEST 2: Submit Tiket Eksternal');
  console.log('='.repeat(50));

  if (!units || units.length === 0) {
    console.error('❌ Tidak ada unit untuk testing');
    return false;
  }

  const testUnit = units[0];
  const testCategory = categories && categories.length > 0 ? categories[0] : null;
  const testPatientType = patientTypes && patientTypes.length > 0 ? patientTypes[0] : null;

  // Test dengan service_type yang berbeda
  const serviceTypes = ['complaint', 'request', 'suggestion', 'survey'];
  const typeMapping = {
    'complaint': 'complaint',
    'request': 'information',
    'suggestion': 'suggestion',
    'survey': 'satisfaction'
  };

  for (const serviceType of serviceTypes) {
    console.log(`\n📝 Testing service_type: ${serviceType}`);
    
    const ticketData = {
      ticket_number: `EXT-TEST-${Date.now()}`,
      type: typeMapping[serviceType],
      title: `Test Tiket Eksternal - ${serviceType}`,
      description: `Ini adalah test tiket eksternal dengan service_type ${serviceType}`,
      unit_id: testUnit.id,
      category_id: testCategory ? testCategory.id : null,
      patient_type_id: testPatientType ? testPatientType.id : null,
      priority: serviceType === 'complaint' ? 'high' : 'medium',
      status: 'open',
      sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      source: 'web',
      is_anonymous: false,
      submitter_name: 'Test User External',
      submitter_email: 'test.external@example.com',
      submitter_phone: '081234567890'
    };

    console.log('📤 Mengirim data:', {
      ticket_number: ticketData.ticket_number,
      type: ticketData.type,
      service_type_original: serviceType,
      unit_id: ticketData.unit_id
    });

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();

    if (error) {
      console.error(`❌ GAGAL submit tiket eksternal (${serviceType}):`);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
      return false;
    }

    console.log(`✅ BERHASIL submit tiket eksternal (${serviceType})!`);
    console.log('   Ticket Number:', data.ticket_number);

    // Cleanup
    await supabase.from('tickets').delete().eq('id', data.id);
    console.log('🧹 Test ticket dihapus');
  }

  return true;
}

async function testSurveySubmit(units, categories, patientTypes) {
  console.log('\n\n🧪 TEST 3: Submit Survey');
  console.log('='.repeat(50));

  if (!units || units.length === 0) {
    console.error('❌ Tidak ada unit untuk testing');
    return false;
  }

  const testUnit = units[0];
  const testCategory = categories && categories.length > 0 ? categories[0] : null;
  const testPatientType = patientTypes && patientTypes.length > 0 ? patientTypes[0] : null;

  const surveyData = {
    unit_id: testUnit.id,
    service_category_id: testCategory ? testCategory.id : null,
    patient_type: testPatientType ? testPatientType.name : null,
    visitor_name: 'Test Survey User',
    visitor_email: 'test.survey@example.com',
    visitor_phone: '081234567890',
    service_type: 'rawat_jalan',
    age_range: '26-35',
    gender: 'male',
    education: 'S1',
    job: 'Pegawai Swasta',
    is_anonymous: false,
    q1_score: 4,
    q2_score: 4,
    q3_score: 3,
    q4_score: 4,
    q5_score: 4,
    q6_score: 3,
    q7_score: 4,
    q8_score: 4,
    overall_score: 4,
    comments: 'Test survey submission',
    source: 'public_survey'
  };

  console.log('📤 Mengirim data survey:', {
    unit_id: surveyData.unit_id,
    visitor_phone: surveyData.visitor_phone,
    service_type: surveyData.service_type
  });

  const { data, error } = await supabase
    .from('public_surveys')
    .insert(surveyData)
    .select()
    .single();

  if (error) {
    console.error('❌ GAGAL submit survey:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error.details);
    return false;
  }

  console.log('✅ BERHASIL submit survey!');
  console.log('   Survey ID:', data.id);
  console.log('   Overall Score:', data.overall_score);

  // Cleanup
  await supabase.from('public_surveys').delete().eq('id', data.id);
  console.log('🧹 Test survey dihapus');

  return true;
}

async function main() {
  console.log('🚀 Memulai perbaikan dan testing submit forms...\n');

  try {
    // 1. Check database
    const { units, categories, patientTypes, qrCodes } = await checkAndFixDatabase();

    // 2. Test Internal Ticket
    const internalOk = await testInternalTicketSubmit(units, categories);

    // 3. Test External Ticket
    const externalOk = await testExternalTicketSubmit(units, categories, patientTypes);

    // 4. Test Survey
    const surveyOk = await testSurveySubmit(units, categories, patientTypes);

    // Summary
    console.log('\n\n📊 RINGKASAN HASIL TEST');
    console.log('='.repeat(50));
    console.log(`Tiket Internal: ${internalOk ? '✅ BERHASIL' : '❌ GAGAL'}`);
    console.log(`Tiket Eksternal: ${externalOk ? '✅ BERHASIL' : '❌ GAGAL'}`);
    console.log(`Survey: ${surveyOk ? '✅ BERHASIL' : '❌ GAGAL'}`);

    if (internalOk && externalOk && surveyOk) {
      console.log('\n🎉 SEMUA TEST BERHASIL!');
      console.log('✅ Submit form sudah berfungsi dengan baik');
    } else {
      console.log('\n⚠️ ADA TEST YANG GAGAL');
      console.log('Silakan periksa error di atas untuk detail masalah');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
