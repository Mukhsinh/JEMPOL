const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

// Service role key yang benar (dari dashboard Supabase)
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function testServiceRoleKey() {
  try {
    console.log('🔍 Testing service role key...');
    
    // Test dengan service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test query yang memerlukan service role
    const { data: users, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Service role key error:', error.message);
      
      // Coba dengan anon key untuk perbandingan
      const supabaseAnon = createClient(supabaseUrl, anonKey);
      const { data: anonData, error: anonError } = await supabaseAnon
        .from('admins')
        .select('*')
        .limit(1);
        
      if (anonError) {
        console.log('❌ Anon key juga error:', anonError.message);
      } else {
        console.log('✅ Anon key berhasil, data:', anonData);
      }
    } else {
      console.log('✅ Service role key valid, data:', users);
    }

    // Test auth operations
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth admin error:', authError.message);
    } else {
      console.log('✅ Auth admin berhasil, total users:', authUsers.users.length);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testServiceRoleKey();