/**
 * Script untuk memperbaiki redirect URL QR Code
 * Memastikan semua QR Code dengan redirect_type='internal_ticket' 
 * mengarah ke /form/internal (TANPA SIDEBAR) bukan /tickets/create/internal
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixQRRedirectUrls() {
  console.log('🔄 Memeriksa QR Codes di database...\n');

  try {
    // Ambil semua QR codes
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error mengambil QR codes:', error.message);
      return;
    }

    if (!qrCodes || qrCodes.length === 0) {
      console.log('ℹ️  Tidak ada QR code di database');
      return;
    }

    console.log(`✅ Ditemukan ${qrCodes.length} QR codes\n`);
    console.log('========================================');

    for (const qr of qrCodes) {
      console.log(`\nQR Code: ${qr.name}`);
      console.log(`  ID: ${qr.id}`);
      console.log(`  Code: ${qr.code}`);
      console.log(`  Unit ID: ${qr.unit_id}`);
      console.log(`  Redirect Type: ${qr.redirect_type || 'selection'}`);
      console.log(`  Auto Fill Unit: ${qr.auto_fill_unit !== false ? 'Ya' : 'Tidak'}`);
      console.log(`  Status: ${qr.is_active ? 'Aktif' : 'Tidak Aktif'}`);

      // Generate URL yang benar
      const baseUrl = 'http://localhost:3003'; // Sesuaikan dengan environment
      const params = new URLSearchParams();
      params.append('qr', qr.code);
      
      if (qr.auto_fill_unit !== false && qr.unit_id) {
        params.append('unit_id', qr.unit_id);
      }

      let correctUrl = '';
      switch (qr.redirect_type) {
        case 'internal_ticket':
          correctUrl = `${baseUrl}/form/internal?${params.toString()}`;
          break;
        case 'external_ticket':
          correctUrl = `${baseUrl}/form/eksternal?${params.toString()}`;
          break;
        case 'survey':
          correctUrl = `${baseUrl}/form/survey?${params.toString()}`;
          break;
        default:
          correctUrl = `${baseUrl}/m/${qr.code}`;
      }

      console.log(`  ✓ URL yang BENAR: ${correctUrl}`);
      
      // Periksa apakah ada field redirect_url yang salah (jika ada)
      if (qr.redirect_url && qr.redirect_url.includes('/tickets/create/')) {
        console.log(`  ⚠️  DITEMUKAN URL SALAH: ${qr.redirect_url}`);
        console.log(`  🔧 Perlu diperbaiki!`);
      }
    }

    console.log('\n========================================');
    console.log('\n📋 RINGKASAN:');
    console.log(`Total QR Codes: ${qrCodes.length}`);
    
    const internalTickets = qrCodes.filter(qr => qr.redirect_type === 'internal_ticket');
    const externalTickets = qrCodes.filter(qr => qr.redirect_type === 'external_ticket');
    const surveys = qrCodes.filter(qr => qr.redirect_type === 'survey');
    const selections = qrCodes.filter(qr => !qr.redirect_type || qr.redirect_type === 'selection');

    console.log(`  - Form Tiket Internal: ${internalTickets.length}`);
    console.log(`  - Form Tiket Eksternal: ${externalTickets.length}`);
    console.log(`  - Form Survei: ${surveys.length}`);
    console.log(`  - Pilihan Menu: ${selections.length}`);

    console.log('\n✅ Pemeriksaan selesai!');
    console.log('\nCATATAN:');
    console.log('- Pastikan redirect_type sudah benar di database');
    console.log('- URL akan di-generate otomatis oleh frontend');
    console.log('- Tidak perlu menyimpan URL di database');
    console.log('- Jika masih salah, edit QR Code di halaman QR Management');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Jalankan script
fixQRRedirectUrls()
  .then(() => {
    console.log('\n✅ Script selesai');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script gagal:', error);
    process.exit(1);
  });
