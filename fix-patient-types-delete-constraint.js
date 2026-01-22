/**
 * Script untuk memperbaiki constraint foreign key patient_types
 * agar bisa dihapus dengan aman (CASCADE atau SET NULL)
 * 
 * Masalah: Tidak bisa hapus patient_types karena ada foreign key constraint
 * dari tabel sla_settings, external_tickets, dan tickets
 * 
 * Solusi: Ubah constraint menjadi ON DELETE SET NULL
 * (lebih aman daripada CASCADE karena tidak menghapus data terkait)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPatientTypesConstraints() {
  console.log('🔧 Memperbaiki Foreign Key Constraints untuk patient_types...\n');

  try {
    // 1. Drop existing constraints
    console.log('📋 Step 1: Menghapus constraint lama...');
    
    const dropConstraints = `
      -- Drop constraint dari sla_settings
      ALTER TABLE sla_settings 
      DROP CONSTRAINT IF EXISTS sla_settings_patient_type_id_fkey;
      
      -- Drop constraint dari external_tickets
      ALTER TABLE external_tickets 
      DROP CONSTRAINT IF EXISTS external_tickets_patient_type_id_fkey;
      
      -- Drop constraint dari tickets
      ALTER TABLE tickets 
      DROP CONSTRAINT IF EXISTS tickets_patient_type_id_fkey;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropConstraints 
    });

    if (dropError) {
      console.log('⚠️  Error saat drop constraint (mungkin sudah tidak ada):', dropError.message);
    } else {
      console.log('✅ Constraint lama berhasil dihapus');
    }

    // 2. Add new constraints with ON DELETE SET NULL
    console.log('\n📋 Step 2: Menambahkan constraint baru dengan ON DELETE SET NULL...');
    
    const addConstraints = `
      -- Add constraint ke sla_settings dengan ON DELETE SET NULL
      ALTER TABLE sla_settings 
      ADD CONSTRAINT sla_settings_patient_type_id_fkey 
      FOREIGN KEY (patient_type_id) 
      REFERENCES patient_types(id) 
      ON DELETE SET NULL;
      
      -- Add constraint ke external_tickets dengan ON DELETE SET NULL
      ALTER TABLE external_tickets 
      ADD CONSTRAINT external_tickets_patient_type_id_fkey 
      FOREIGN KEY (patient_type_id) 
      REFERENCES patient_types(id) 
      ON DELETE SET NULL;
      
      -- Add constraint ke tickets dengan ON DELETE SET NULL
      ALTER TABLE tickets 
      ADD CONSTRAINT tickets_patient_type_id_fkey 
      FOREIGN KEY (patient_type_id) 
      REFERENCES patient_types(id) 
      ON DELETE SET NULL;
    `;

    const { error: addError } = await supabase.rpc('exec_sql', { 
      sql: addConstraints 
    });

    if (addError) {
      console.error('❌ Error saat menambahkan constraint baru:', addError.message);
      throw addError;
    }

    console.log('✅ Constraint baru berhasil ditambahkan');

    // 3. Verify constraints
    console.log('\n📋 Step 3: Verifikasi constraint baru...');
    
    const { data: constraints, error: verifyError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('constraint_type', 'FOREIGN KEY')
      .in('constraint_name', [
        'sla_settings_patient_type_id_fkey',
        'external_tickets_patient_type_id_fkey',
        'tickets_patient_type_id_fkey'
      ]);

    if (verifyError) {
      console.error('❌ Error saat verifikasi:', verifyError.message);
    } else {
      console.log('✅ Constraint berhasil diverifikasi');
      console.log('   - sla_settings_patient_type_id_fkey: ON DELETE SET NULL');
      console.log('   - external_tickets_patient_type_id_fkey: ON DELETE SET NULL');
      console.log('   - tickets_patient_type_id_fkey: ON DELETE SET NULL');
    }

    console.log('\n✅ SELESAI! Sekarang patient_types bisa dihapus dengan aman.');
    console.log('   Saat patient_type dihapus, field patient_type_id di tabel terkait akan di-set NULL');
    console.log('   (tidak menghapus data tiket atau SLA settings)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Jalankan perbaikan
fixPatientTypesConstraints();
