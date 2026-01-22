import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixPatientTypesRLS() {
  console.log('🔧 Memperbaiki RLS policies untuk patient_types...\n');

  try {
    // 1. Cek data yang ada
    console.log('1️⃣ Mengecek data patient_types...');
    const { data: existingData, error: fetchError } = await supabase
      .from('patient_types')
      .select('*')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching data:', fetchError.message);
    } else {
      console.log(`✅ Ditemukan ${existingData?.length || 0} patient types`);
      existingData?.forEach(pt => {
        console.log(`   - ${pt.name} (${pt.code}) - ${pt.is_active ? 'Aktif' : 'Tidak Aktif'}`);
      });
    }

    // 2. Test update
    console.log('\n2️⃣ Testing update operation...');
    if (existingData && existingData.length > 0) {
      const testItem = existingData[0];
      console.log(`   Testing update pada: ${testItem.name}`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('patient_types')
        .update({ 
          description: testItem.description || 'Test update',
          updated_at: new Date().toISOString() 
        })
        .eq('id', testItem.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Update failed:', updateError.message);
        console.log('   Hint:', updateError.hint);
        console.log('   Details:', updateError.details);
      } else {
        console.log('✅ Update berhasil!');
      }
    }

    // 3. Test delete (soft delete dengan is_active)
    console.log('\n3️⃣ Testing soft delete operation...');
    if (existingData && existingData.length > 0) {
      const testItem = existingData[existingData.length - 1];
      console.log(`   Testing soft delete pada: ${testItem.name}`);
      
      const { data: deleteData, error: deleteError } = await supabase
        .from('patient_types')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString() 
        })
        .eq('id', testItem.id)
        .select()
        .single();

      if (deleteError) {
        console.error('❌ Soft delete failed:', deleteError.message);
      } else {
        console.log('✅ Soft delete berhasil!');
        
        // Restore
        await supabase
          .from('patient_types')
          .update({ is_active: true })
          .eq('id', testItem.id);
        console.log('✅ Data restored');
      }
    }

    // 4. Cek RLS policies
    console.log('\n4️⃣ Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'patient_types' })
      .catch(() => ({ data: null, error: null }));

    if (policies) {
      console.log('📋 Current policies:', policies);
    } else {
      console.log('⚠️  Cannot fetch policies (this is normal if RPC doesn\'t exist)');
    }

    console.log('\n✅ Selesai! Jika ada error, RLS policies mungkin perlu diperbaiki di Supabase Dashboard.');
    console.log('\n📝 Solusi jika masih error:');
    console.log('   1. Buka Supabase Dashboard');
    console.log('   2. Pilih tabel patient_types');
    console.log('   3. Pastikan RLS policies mengizinkan UPDATE dan DELETE');
    console.log('   4. Atau disable RLS untuk testing: ALTER TABLE patient_types DISABLE ROW LEVEL SECURITY;');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixPatientTypesRLS();
