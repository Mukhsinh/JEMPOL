const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseServiceKey = 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixQRManagementAuthSession() {
  console.log('🔧 Memperbaiki masalah authentication pada QR Management...');
  
  try {
    // 1. Periksa admin yang ada
    console.log('📋 Memeriksa admin yang tersedia...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('❌ Error mengambil data admin:', adminError);
      return;
    }
    
    console.log(`✅ Ditemukan ${admins.length} admin aktif`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role})`);
    });
    
    // 2. Periksa RLS policies untuk tabel yang digunakan QR Management
    console.log('\n🔒 Memeriksa RLS policies...');
    
    const tables = ['units', 'qr_codes', 'unit_types'];
    for (const table of tables) {
      const { data: policies, error: policyError } = await supabase
        .rpc('get_table_policies', { table_name: table });
      
      if (!policyError && policies) {
        console.log(`✅ Policies untuk tabel ${table}:`, policies.length);
      } else {
        console.log(`⚠️ Tidak dapat memeriksa policies untuk ${table}`);
      }
    }
    
    console.log('\n✅ Diagnosis selesai. Masalah kemungkinan ada pada:');
    console.log('1. Session management di frontend');
    console.log('2. Token validation di backend');
    console.log('3. RLS policies yang terlalu ketat');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixQRManagementAuthSession();