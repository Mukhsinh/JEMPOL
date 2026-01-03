const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLogin() {
  try {
    console.log('🔄 Memverifikasi login admin...');
    
    const email = 'admin@jempol.com';
    const password = 'admin123';
    
    // Clear any existing session
    await supabase.auth.signOut();
    
    // Test login
    console.log('📧 Testing login for:', email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (authError) {
      console.error('❌ Login gagal:', authError.message);
      return false;
    }
    
    if (!authData.user || !authData.session) {
      console.error('❌ Login gagal: Tidak ada data user');
      return false;
    }
    
    console.log('✅ Login berhasil!');
    console.log('👤 User ID:', authData.user.id);
    console.log('📧 Email:', authData.user.email);
    
    // Test getting admin profile
    console.log('🔄 Mengambil profil admin...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select('id, username, full_name, email, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();
    
    if (profileError || !adminProfile) {
      console.error('❌ Gagal mengambil profil admin:', profileError?.message);
      return false;
    }
    
    console.log('✅ Profil admin berhasil diambil:');
    console.log('   ID:', adminProfile.id);
    console.log('   Username:', adminProfile.username);
    console.log('   Nama:', adminProfile.full_name);
    console.log('   Email:', adminProfile.email);
    console.log('   Role:', adminProfile.role);
    console.log('   Aktif:', adminProfile.is_active);
    
    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Logout berhasil');
    
    console.log('\n=== HASIL VERIFIKASI ===');
    console.log('✅ Login berfungsi dengan baik!');
    console.log('📧 Email: admin@jempol.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 URL: http://localhost:3001/login');
    console.log('========================');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error tidak terduga:', error);
    return false;
  }
}

verifyLogin();