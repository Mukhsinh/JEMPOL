// Script untuk memastikan admin@jempol.com ada di database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function ensureAdminJempol() {
  try {
    console.log('🔍 Memeriksa admin@jempol.com...');
    
    // Periksa apakah admin sudah ada
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@jempol.com');
    
    if (checkError) {
      console.error('❌ Error checking admin:', checkError.message);
      return;
    }
    
    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Admin sudah ada:', existingAdmin[0]);
      
      // Pastikan admin aktif
      if (!existingAdmin[0].is_active) {
        console.log('🔄 Mengaktifkan admin...');
        const { error: updateError } = await supabase
          .from('admins')
          .update({ is_active: true })
          .eq('email', 'admin@jempol.com');
        
        if (updateError) {
          console.error('❌ Error mengaktifkan admin:', updateError.message);
        } else {
          console.log('✅ Admin berhasil diaktifkan');
        }
      }
    } else {
      console.log('⚠️ Admin tidak ditemukan, akan dibuat...');
      console.log('ℹ️ Pastikan user admin@jempol.com sudah ada di auth.users');
    }
    
    // Test query dengan berbagai strategi
    console.log('\n🧪 Testing query strategies...');
    
    // Strategy 1: maybeSingle
    try {
      const { data: data1, error: error1 } = await supabase
        .from('admins')
        .select('id, username, full_name, email, role, is_active')
        .eq('email', 'admin@jempol.com')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error1) {
        console.log('⚠️ Strategy 1 (maybeSingle) failed:', error1.message);
      } else {
        console.log('✅ Strategy 1 (maybeSingle) success:', data1);
      }
    } catch (error) {
      console.log('❌ Strategy 1 exception:', error.message);
    }
    
    // Strategy 2: array query
    try {
      const { data: data2, error: error2 } = await supabase
        .from('admins')
        .select('id, username, full_name, email, role, is_active')
        .eq('email', 'admin@jempol.com')
        .eq('is_active', true)
        .limit(1);
      
      if (error2) {
        console.log('⚠️ Strategy 2 (array) failed:', error2.message);
      } else {
        console.log('✅ Strategy 2 (array) success:', data2);
      }
    } catch (error) {
      console.log('❌ Strategy 2 exception:', error.message);
    }
    
    // Strategy 3: all fields
    try {
      const { data: data3, error: error3 } = await supabase
        .from('admins')
        .select('*')
        .eq('email', 'admin@jempol.com')
        .eq('is_active', true);
      
      if (error3) {
        console.log('⚠️ Strategy 3 (all fields) failed:', error3.message);
      } else {
        console.log('✅ Strategy 3 (all fields) success:', data3);
      }
    } catch (error) {
      console.log('❌ Strategy 3 exception:', error.message);
    }
    
    console.log('\n✅ Pemeriksaan selesai!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

ensureAdminJempol();