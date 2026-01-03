const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Konfigurasi Supabase
const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function ensureAdminUser() {
  console.log('🔧 Memastikan admin user untuk QR Management...');
  
  try {
    const adminEmail = 'admin@kiss.com';
    const adminPassword = 'admin123';
    
    // 1. Cek apakah admin sudah ada di auth.users
    console.log('\n1. Memeriksa admin di auth.users...');
    
    // 2. Buat admin user di Supabase Auth jika belum ada
    console.log('\n2. Membuat admin user di Supabase Auth...');
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      });
      
      if (authError && !authError.message.includes('already registered')) {
        console.error('❌ Error creating auth user:', authError.message);
      } else {
        console.log('✅ Auth user ready');
      }
    } catch (error) {
      console.log('⚠️ Auth user might already exist');
    }
    
    // 3. Pastikan admin ada di tabel admins
    console.log('\n3. Memastikan admin di tabel admins...');
    
    // Login untuk mendapatkan session
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.error('❌ Login error:', loginError.message);
      return;
    }
    
    console.log('✅ Login berhasil');
    
    // Cek apakah admin sudah ada di tabel admins
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking admin:', checkError.message);
      return;
    }
    
    if (!existingAdmin) {
      console.log('📝 Membuat record admin...');
      
      // Hash password untuk tabel admins
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const { data: newAdmin, error: insertError } = await supabase
        .from('admins')
        .insert({
          username: 'admin',
          email: adminEmail,
          password_hash: hashedPassword,
          full_name: 'Administrator',
          role: 'admin',
          is_active: true
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error creating admin record:', insertError.message);
        return;
      }
      
      console.log('✅ Admin record created:', newAdmin.email);
    } else {
      console.log('✅ Admin record already exists:', existingAdmin.email);
      
      // Update admin to ensure it's active
      const { error: updateError } = await supabase
        .from('admins')
        .update({ is_active: true })
        .eq('email', adminEmail);
      
      if (updateError) {
        console.error('❌ Error updating admin:', updateError.message);
      } else {
        console.log('✅ Admin status updated');
      }
    }
    
    // 4. Test authentication
    console.log('\n4. Testing authentication...');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ Session active:', session.user.email);
      console.log('✅ Token available:', session.access_token.substring(0, 50) + '...');
    } else {
      console.log('❌ No active session');
    }
    
    console.log('\n✅ Admin user setup selesai!');
    console.log('\n📋 Kredensial admin:');
    console.log('Email: admin@kiss.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Jalankan setup
ensureAdminUser();