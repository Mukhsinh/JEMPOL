// Script untuk memperbaiki password Supabase Auth
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuthPasswords() {
  try {
    console.log('🔄 Memperbaiki password Supabase Auth...');

    // Update password untuk admin@jempol.com
    const { data: user1, error: error1 } = await supabase.auth.admin.updateUserById(
      'e235a49c-e8bb-4a28-8571-8509a849ee5c', // ID dari auth.users
      { password: 'admin123' }
    );

    if (error1) {
      console.error('❌ Error update password admin@jempol.com:', error1.message);
    } else {
      console.log('✅ Password admin@jempol.com berhasil diupdate');
    }

    // Update password untuk mukhsin9@gmail.com
    const { data: user2, error: error2 } = await supabase.auth.admin.updateUserById(
      'c9dc4e08-c47e-4669-8b4d-79f57b00b19c', // ID dari auth.users
      { password: 'mukhsin123' }
    );

    if (error2) {
      console.error('❌ Error update password mukhsin9@gmail.com:', error2.message);
    } else {
      console.log('✅ Password mukhsin9@gmail.com berhasil diupdate');
    }

    console.log('\n✅ Selesai! Coba login dengan:');
    console.log('Email: admin@jempol.com, Password: admin123');
    console.log('Email: mukhsin9@gmail.com, Password: mukhsin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAuthPasswords();