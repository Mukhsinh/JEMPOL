// Script untuk memperbaiki error 406 pada login
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixLoginError() {
  try {
    console.log('🔧 Memperbaiki error login 406...');
    
    // 1. Periksa koneksi ke Supabase
    console.log('📡 Memeriksa koneksi ke Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('admins')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error koneksi:', testError);
      return;
    }
    
    console.log('✅ Koneksi ke Supabase berhasil');
    
    // 2. Periksa data admin dengan email admin@jempol.com
    console.log('👤 Memeriksa data admin...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@jempol.com')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('❌ Error mengambil data admin:', adminError);
      return;
    }
    
    if (!adminData || adminData.length === 0) {
      console.log('⚠️ Admin tidak ditemukan, membuat admin baru...');
      
      const { data: newAdmin, error: insertError } = await supabase
        .from('admins')
        .insert({
          username: 'admin_jempol',
          email: 'admin@jempol.com',
          password_hash: '$2b$10$dummy.hash.for.supabase.auth',
          full_name: 'Admin Jempol',
          role: 'superadmin',
          is_active: true
        })
        .select();
      
      if (insertError) {
        console.error('❌ Error membuat admin:', insertError);
        return;
      }
      
      console.log('✅ Admin berhasil dibuat:', newAdmin);
    } else {
      console.log('✅ Admin ditemukan:', adminData[0]);
    }
    
    // 3. Test query dengan berbagai format
    console.log('🧪 Testing query format...');
    
    // Test dengan single()
    try {
      const { data: singleData, error: singleError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', 'admin@jempol.com')
        .eq('is_active', true)
        .single();
      
      if (singleError) {
        console.log('⚠️ Single query error:', singleError.message);
      } else {
        console.log('✅ Single query berhasil:', singleData);
      }
    } catch (error) {
      console.log('⚠️ Single query exception:', error.message);
    }
    
    // Test tanpa single()
    try {
      const { data: arrayData, error: arrayError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', 'admin@jempol.com')
        .eq('is_active', true);
      
      if (arrayError) {
        console.log('⚠️ Array query error:', arrayError.message);
      } else {
        console.log('✅ Array query berhasil:', arrayData);
      }
    } catch (error) {
      console.log('⚠️ Array query exception:', error.message);
    }
    
    console.log('✅ Perbaikan selesai!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixLoginError();