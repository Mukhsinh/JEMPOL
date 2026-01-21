const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixQRUnitIdIssue() {
  console.log('🔍 Memeriksa QR codes dan unit_id...\n');

  try {
    // 1. Ambil semua QR codes
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (qrError) {
      console.error('❌ Error mengambil QR codes:', qrError);
      return;
    }

    console.log(`📊 Total QR codes: ${qrCodes.length}\n`);

    // 2. Periksa setiap QR code
    for (const qr of qrCodes) {
      console.log(`\n🔍 QR Code: ${qr.name} (${qr.code})`);
      console.log(`   Unit ID: ${qr.unit_id || 'TIDAK ADA'}`);
      console.log(`   Status: ${qr.is_active ? 'Aktif' : 'Tidak Aktif'}`);
      console.log(`   Redirect Type: ${qr.redirect_type || 'selection'}`);

      // Jika tidak ada unit_id, coba ambil unit pertama
      if (!qr.unit_id) {
        console.log('   ⚠️ Unit ID tidak ada, mencari unit default...');
        
        const { data: units, error: unitError } = await supabase
          .from('units')
          .select('id, name, code')
          .eq('is_active', true)
          .limit(1);

        if (unitError || !units || units.length === 0) {
          console.log('   ❌ Tidak ada unit aktif di database');
          continue;
        }

        const defaultUnit = units[0];
        console.log(`   ✅ Menggunakan unit default: ${defaultUnit.name} (${defaultUnit.id})`);

        // Update QR code dengan unit_id
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({ unit_id: defaultUnit.id })
          .eq('id', qr.id);

        if (updateError) {
          console.log('   ❌ Error update:', updateError.message);
        } else {
          console.log('   ✅ QR code berhasil diupdate dengan unit_id');
        }
      } else {
        // Verifikasi unit_id valid
        const { data: unit, error: unitError } = await supabase
          .from('units')
          .select('id, name, code')
          .eq('id', qr.unit_id)
          .single();

        if (unitError || !unit) {
          console.log('   ❌ Unit ID tidak valid atau unit tidak ditemukan');
          
          // Cari unit default
          const { data: units } = await supabase
            .from('units')
            .select('id, name, code')
            .eq('is_active', true)
            .limit(1);

          if (units && units.length > 0) {
            const defaultUnit = units[0];
            console.log(`   ✅ Menggunakan unit default: ${defaultUnit.name}`);

            const { error: updateError } = await supabase
              .from('qr_codes')
              .update({ unit_id: defaultUnit.id })
              .eq('id', qr.id);

            if (!updateError) {
              console.log('   ✅ QR code berhasil diupdate');
            }
          }
        } else {
          console.log(`   ✅ Unit valid: ${unit.name} (${unit.code})`);
        }
      }
    }

    // 3. Tampilkan ringkasan
    console.log('\n\n📊 RINGKASAN:');
    console.log('=====================================');
    
    const { data: updatedQRs } = await supabase
      .from('qr_codes')
      .select(`
        id,
        name,
        code,
        unit_id,
        is_active,
        redirect_type,
        units:unit_id (
          id,
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (updatedQRs) {
      console.log(`\n✅ QR Codes dengan unit_id valid: ${updatedQRs.filter(q => q.unit_id).length}`);
      console.log(`❌ QR Codes tanpa unit_id: ${updatedQRs.filter(q => !q.unit_id).length}`);
      
      console.log('\n📋 Daftar QR Codes:');
      updatedQRs.forEach(qr => {
        const unitName = qr.units?.name || 'TIDAK ADA UNIT';
        const status = qr.is_active ? '✅' : '❌';
        console.log(`${status} ${qr.name} → ${unitName}`);
        console.log(`   URL: /qr/${qr.code}`);
        console.log(`   Redirect: ${qr.redirect_type || 'selection'}`);
      });
    }

    // 4. Test URL untuk QR code pertama
    if (updatedQRs && updatedQRs.length > 0) {
      const testQR = updatedQRs[0];
      console.log('\n\n🧪 TEST URL:');
      console.log('=====================================');
      console.log(`QR Code: ${testQR.name}`);
      console.log(`Scan URL: http://localhost:3002/qr/${testQR.code}`);
      
      if (testQR.redirect_type === 'external_ticket' || !testQR.redirect_type) {
        const params = new URLSearchParams({
          qr: testQR.code,
          unit_id: testQR.unit_id,
          unit_name: testQR.units?.name || '',
          auto_fill: 'true'
        });
        console.log(`Direct URL: http://localhost:3002/form/eksternal?${params.toString()}`);
      }
    }

    console.log('\n✅ Selesai!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixQRUnitIdIssue();
