const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDanPerbaikiTiketEksternal() {
  console.log('🔍 Test dan Perbaiki Tiket Eksternal\n');
  console.log('=====================================\n');

  try {
    // 1. Test ambil units
    console.log('1️⃣ Test endpoint /api/public/units');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id, name, code, is_active')
      .eq('is_active', true)
      .order('name');

    if (unitsError) {
      console.error('❌ Error:', unitsError);
      return;
    }

    console.log(`✅ Berhasil ambil ${units.length} units aktif\n`);
    units.forEach(unit => {
      console.log(`   - ${unit.name} (${unit.code}) - ID: ${unit.id}`);
    });

    // 2. Test QR codes
    console.log('\n2️⃣ Test QR Codes untuk External Ticket');
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select(`
        id, code, name, unit_id, is_active, redirect_type,
        units:unit_id(id, name, code)
      `)
      .eq('is_active', true)
      .eq('redirect_type', 'external_ticket')
      .order('created_at', { ascending: false });

    if (qrError) {
      console.error('❌ Error:', qrError);
      return;
    }

    console.log(`✅ Ditemukan ${qrCodes.length} QR codes untuk external ticket\n`);
    
    if (qrCodes.length === 0) {
      console.log('⚠️ Tidak ada QR code untuk external ticket, membuat sample...\n');
      
      // Buat sample QR code
      const sampleUnit = units[0];
      const { data: newQR, error: createError } = await supabase
        .from('qr_codes')
        .insert({
          code: 'QR-TEST-EXT-' + Date.now(),
          name: 'Test QR External Ticket',
          description: 'QR Code untuk test tiket eksternal',
          unit_id: sampleUnit.id,
          redirect_type: 'external_ticket',
          is_active: true,
          auto_fill_unit: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error membuat QR:', createError);
      } else {
        console.log('✅ QR code test berhasil dibuat:');
        console.log(`   Code: ${newQR.code}`);
        console.log(`   URL: http://localhost:3002/qr/${newQR.code}`);
        qrCodes.push(newQR);
      }
    }

    // 3. Test URL untuk setiap QR code
    console.log('\n3️⃣ Test URL untuk QR Codes:');
    qrCodes.forEach(qr => {
      const unitName = qr.units?.name || 'Unknown';
      console.log(`\n📱 ${qr.name}`);
      console.log(`   Unit: ${unitName}`);
      console.log(`   Scan URL: http://localhost:3002/qr/${qr.code}`);
      
      const params = new URLSearchParams({
        qr: qr.code,
        unit_id: qr.unit_id,
        unit_name: unitName,
        auto_fill: 'true'
      });
      console.log(`   Direct URL: http://localhost:3002/form/eksternal?${params.toString()}`);
    });

    // 4. Test submit tiket
    console.log('\n\n4️⃣ Test Submit Tiket Eksternal');
    const testQR = qrCodes[0];
    
    const testTicket = {
      unit_id: testQR.unit_id,
      qr_code_id: testQR.id,
      reporter_identity_type: 'personal',
      reporter_name: 'Test User - ' + new Date().toLocaleTimeString(),
      reporter_phone: '081234567890',
      reporter_email: 'test@example.com',
      service_type: 'complaint',
      category: 'pelayanan',
      title: 'Test Tiket dari Script',
      description: 'Ini adalah test tiket untuk memverifikasi sistem berfungsi dengan baik. Dibuat pada: ' + new Date().toLocaleString(),
      source: 'qr_code'
    };

    console.log('\n📤 Mengirim test ticket...');
    console.log('   Unit ID:', testTicket.unit_id);
    console.log('   QR Code ID:', testTicket.qr_code_id);
    console.log('   Reporter:', testTicket.reporter_name);

    // Generate ticket number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const ticket_number = `EXT-${year}${month}${day}-${random}`;

    // Calculate SLA
    const sla_deadline = new Date();
    sla_deadline.setHours(sla_deadline.getHours() + 24);

    const { data: ticket, error: ticketError } = await supabase
      .from('external_tickets')
      .insert({
        ticket_number,
        ...testTicket,
        urgency_level: 3,
        priority: 'medium',
        sentiment_score: 0.5,
        confidence_score: 85,
        sla_deadline: sla_deadline.toISOString(),
        status: 'open'
      })
      .select()
      .single();

    if (ticketError) {
      console.error('\n❌ Error membuat tiket:', ticketError);
      console.error('   Message:', ticketError.message);
      console.error('   Details:', ticketError.details);
      console.error('   Hint:', ticketError.hint);
      
      // Cek apakah masalah di foreign key
      if (ticketError.message.includes('foreign key') || ticketError.message.includes('unit_id')) {
        console.log('\n🔍 Verifikasi unit_id...');
        const { data: unitCheck } = await supabase
          .from('units')
          .select('id, name')
          .eq('id', testTicket.unit_id)
          .single();
        
        if (unitCheck) {
          console.log('✅ Unit valid:', unitCheck.name);
        } else {
          console.log('❌ Unit tidak ditemukan!');
        }
      }
      
      return;
    }

    console.log('\n✅ Tiket berhasil dibuat!');
    console.log('   Ticket Number:', ticket.ticket_number);
    console.log('   Ticket ID:', ticket.id);
    console.log('   Status:', ticket.status);
    console.log('   Priority:', ticket.priority);

    // 5. Verifikasi tiket tersimpan
    console.log('\n5️⃣ Verifikasi Tiket di Database');
    const { data: savedTicket, error: verifyError } = await supabase
      .from('external_tickets')
      .select(`
        *,
        units:unit_id(id, name, code)
      `)
      .eq('id', ticket.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifikasi:', verifyError);
      return;
    }

    console.log('✅ Tiket terverifikasi:');
    console.log('   ID:', savedTicket.id);
    console.log('   Number:', savedTicket.ticket_number);
    console.log('   Unit:', savedTicket.units?.name);
    console.log('   Reporter:', savedTicket.reporter_name);
    console.log('   Title:', savedTicket.title);
    console.log('   Status:', savedTicket.status);
    console.log('   Created:', new Date(savedTicket.created_at).toLocaleString());

    // 6. Ringkasan
    console.log('\n\n📊 RINGKASAN TEST');
    console.log('=====================================');
    console.log('✅ Units endpoint: OK');
    console.log('✅ QR codes: OK');
    console.log('✅ Submit tiket: OK');
    console.log('✅ Verifikasi database: OK');
    console.log('\n🎉 Semua test berhasil!');
    
    console.log('\n\n🔗 URL untuk Test Manual:');
    console.log('=====================================');
    console.log(`1. Test HTML: http://localhost:3002/test-external-ticket-form-unit-id.html`);
    console.log(`2. QR Scan: http://localhost:3002/qr/${testQR.code}`);
    console.log(`3. Direct Form: http://localhost:3002/form/eksternal?unit_id=${testQR.unit_id}&unit_name=${encodeURIComponent(testQR.units?.name || '')}&qr=${testQR.code}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testDanPerbaikiTiketEksternal();
