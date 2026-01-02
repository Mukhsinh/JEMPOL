const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Service role key

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuthPasswords() {
  try {
    console.log('🔄 Fixing auth passwords...');
    
    // Get all admins
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('❌ Error getting admins:', adminError);
      return;
    }
    
    console.log(`📋 Found ${admins.length} active admins`);
    
    for (const admin of admins) {
      console.log(`\n🔄 Processing admin: ${admin.email}`);
      
      // Check if user exists in auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Error listing auth users:', authError);
        continue;
      }
      
      const existingUser = authUsers.users.find(u => u.email === admin.email);
      
      if (existingUser) {
        console.log(`✅ User exists in auth: ${existingUser.id}`);
        
        // Update password to a known value
        const newPassword = admin.username === 'admin' ? 'admin123' : 'mukhsin123';
        
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            password: newPassword,
            email_confirm: true
          }
        );
        
        if (updateError) {
          console.error(`❌ Error updating password for ${admin.email}:`, updateError);
        } else {
          console.log(`✅ Password updated for ${admin.email} -> ${newPassword}`);
        }
      } else {
        console.log(`⚠️ User not found in auth, creating new user...`);
        
        // Create new user
        const newPassword = admin.username === 'admin' ? 'admin123' : 'mukhsin123';
        
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: newPassword,
          email_confirm: true,
          user_metadata: {
            full_name: admin.full_name,
            username: admin.username,
            role: admin.role
          }
        });
        
        if (createError) {
          console.error(`❌ Error creating user for ${admin.email}:`, createError);
        } else {
          console.log(`✅ User created for ${admin.email} -> ${newPassword}`);
        }
      }
    }
    
    console.log('\n✅ Auth password fix completed!');
    console.log('\n📋 Login credentials:');
    console.log('Email: admin@jempol.com | Password: admin123');
    console.log('Email: mukhsin9@gmail.com | Password: mukhsin123');
    
  } catch (error) {
    console.error('❌ Fix auth passwords error:', error);
  }
}

fixAuthPasswords();