/**
 * Script untuk memperbaiki redirect_type pada QR codes
 * Memastikan semua QR code memiliki redirect_type yang benar
 * sehingga redirect langsung ke form tanpa sidebar
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in backend/.env');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixQRRedirectTypes() {
  console.log('🔧 Memperbaiki redirect_type pada QR codes...\n');

  try {
    // 1. Ambil semua QR codes
    const { data: qrCodes, error: fetchError } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching QR codes:', fetchError);
      return;
    }

    if (!qrCodes || qrCodes.length === 0) {
      console.log('ℹ️  Tidak ada QR code di database');
      return;
    }

    console.log(`📊 Ditemukan ${qrCodes.length} QR codes\n`);

    // 2. Analisis dan perbaiki setiap QR code
    let fixedCount = 0;
    let alreadyCorrect = 0;

    for (const qr of qrCodes) {
      console.log(`\n🔍 Checking QR: ${qr.name} (${qr.code})`);
      console.log(`   Current redirect_type: ${qr.redirect_type || 'NULL'}`);

      // Tentukan redirect_type yang benar
      let correctRedirectType = qr.redirect_type;
      let needsUpdate = false;

      // Jika redirect_type null atau tidak valid, set default
      const validTypes = ['selection', 'internal_ticket', 'external_ticket', 'survey'];
      if (!qr.redirect_type || !validTypes.includes(qr.redirect_type)) {
        // Default ke selection jika tidak ada
        correctRedirectType = 'selection';
        needsUpdate = true;
        console.log(`   ⚠️  Invalid/null redirect_type, setting to: ${correctRedirectType}`);
      }

      // Pastikan show_options ada
      let showOptions = qr.show_options;
      if (!showOptions || !Array.isArray(showOptions) || showOptions.length === 0) {
        showOptions = ['internal_ticket', 'external_ticket', 'survey'];
        needsUpdate = true;
        console.log(`   ⚠️  Missing show_options, setting default`);
      }

      // Pastikan auto_fill_unit ada
      let autoFillUnit = qr.auto_fill_unit;
      if (autoFillUnit === null || autoFillUnit === undefined) {
        autoFillUnit = true;
        needsUpdate = true;
        console.log(`   ⚠️  Missing auto_fill_unit, setting to true`);
      }

      if (needsUpdate) {
        // Update QR code
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({
            redirect_type: correctRedirectType,
            show_options: showOptions,
            auto_fill_unit: autoFillUnit,
            updated_at: new Date().toISOString()
          })
          .eq('id', qr.id);

        if (updateError) {
          console.error(`   ❌ Error updating QR ${qr.code}:`, updateError);
        } else {
          console.log(`   ✅ Updated successfully`);
          fixedCount++;
        }
      } else {
        console.log(`   ✅ Already correct`);
        alreadyCorrect++;
      }
    }

    // 3. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total QR codes: ${qrCodes.length}`);
    console.log(`✅ Already correct: ${alreadyCorrect}`);
    console.log(`🔧 Fixed: ${fixedCount}`);
    console.log('='.repeat(60));

    // 4. Tampilkan contoh URL untuk testing
    console.log('\n📱 CONTOH URL UNTUK TESTING:');
    console.log('='.repeat(60));
    
    const sampleQR = qrCodes[0];
    if (sampleQR) {
      console.log(`\n🔗 QR Code: ${sampleQR.name} (${sampleQR.code})`);
      console.log(`   Redirect Type: ${sampleQR.redirect_type}`);
      console.log(`\n   URL untuk scan:`);
      console.log(`   http://localhost:3002/scan/${sampleQR.code}`);
      console.log(`   http://localhost:3002/m/${sampleQR.code}`);
      
      if (sampleQR.redirect_type === 'internal_ticket') {
        console.log(`\n   Expected redirect ke:`);
        console.log(`   http://localhost:3002/form/internal?qr=${sampleQR.code}&unit_id=${sampleQR.unit_id}&...`);
      } else if (sampleQR.redirect_type === 'external_ticket') {
        console.log(`\n   Expected redirect ke:`);
        console.log(`   http://localhost:3002/form/eksternal?qr=${sampleQR.code}&unit_id=${sampleQR.unit_id}&...`);
      } else if (sampleQR.redirect_type === 'survey') {
        console.log(`\n   Expected redirect ke:`);
        console.log(`   http://localhost:3002/form/survey?qr=${sampleQR.code}&unit_id=${sampleQR.unit_id}&...`);
      } else {
        console.log(`\n   Expected: Tampilkan menu pilihan (selection)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Selesai!');
    console.log('='.repeat(60));

    // 5. Instruksi testing
    console.log('\n📋 CARA TESTING:');
    console.log('1. Buka file: test-qr-redirect-direct-form.html di browser');
    console.log('2. Klik tombol test untuk simulasi redirect');
    console.log('3. Pastikan form muncul TANPA SIDEBAR');
    console.log('4. Pastikan unit info otomatis terisi');
    console.log('5. Pastikan bisa submit form tanpa login\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Jalankan script
console.log('🚀 Starting QR Redirect Type Fix...\n');
fixQRRedirectTypes()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
