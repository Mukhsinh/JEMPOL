const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Konfigurasi Supabase
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkxOTA1MSwiZXhwIjoyMDgwNDk1MDUxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminLogin() {
  console.log('🔧 Starting admin login fix...');
  
  try {
    // 1. Check existing admins
    console.log('📋 Checking existing admins...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*');
    
    if (adminError) {
      console.error('❌ Error fetching admins:', adminError);
      return;
    }
    
    console.log('👥 Found admins:', admins.map(a => ({ email: a.email, username: a.username, is_active: a.is_active })));
    
    // 2. Check auth users
    console.log('🔍 Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    console.log('🔐 Found auth users:', authUsers.users.map(u => ({ 
      id: u.id, 
      email: u.email, 
      email_confirmed_at: u.email_confirmed_at,
      created_at: u.created_at
    })));
    
    // 3. Fix each admin
    for (const admin of admins) {
      if (!admin.is_active) {
        console.log(`⏭️ Skipping inactive admin: ${admin.email}`);
        continue;
      }
      
      console.log(`\n🔧 Fixing admin: ${admin.email}`);
      
      // Find corresponding auth user
      const authUser = authUsers.users.find(u => u.email === admin.email);
      
      if (!authUser) {
        console.log(`❌ No auth user found for ${admin.email}, creating...`);
        
        // Create auth user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: 'password', // Default password
          email_confirm: true,
          user_metadata: {
            username: admin.username,
            full_name: admin.full_name,
            role: admin.role
          }
        });
        
        if (createError) {
          console.error(`❌ Error creating auth user for ${admin.email}:`, createError);
          continue;
        }
        
        console.log(`✅ Created auth user for ${admin.email}`);
        
        // Update admin table with correct ID
        const { error: updateError } = await supabase
          .from('admins')
          .update({ id: newUser.user.id })
          .eq('email', admin.email);
        
        if (updateError) {
          console.error(`❌ Error updating admin ID for ${admin.email}:`, updateError);
        } else {
          console.log(`✅ Updated admin ID for ${admin.email}`);
        }
        
      } else {
        console.log(`✅ Auth user exists for ${admin.email}`);
        
        // Update password to ensure it works
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          authUser.id,
          {
            password: 'password',
            email_confirm: true
          }
        );
        
        if (passwordError) {
          console.error(`❌ Error updating password for ${admin.email}:`, passwordError);
        } else {
          console.log(`✅ Updated password for ${admin.email}`);
        }
        
        // Ensure admin table has correct ID
        if (admin.id !== authUser.id) {
          console.log(`🔄 Updating admin ID from ${admin.id} to ${authUser.id}`);
          
          const { error: updateError } = await supabase
            .from('admins')
            .update({ id: authUser.id })
            .eq('email', admin.email);
          
          if (updateError) {
            console.error(`❌ Error updating admin ID:`, updateError);
          } else {
            console.log(`✅ Updated admin ID for ${admin.email}`);
          }
        }
      }
      
      // Update password hash in admins table to match
      const passwordHash = await bcrypt.hash('password', 10);
      const { error: hashError } = await supabase
        .from('admins')
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('email', admin.email);
      
      if (hashError) {
        console.error(`❌ Error updating password hash for ${admin.email}:`, hashError);
      } else {
        console.log(`✅ Updated password hash for ${admin.email}`);
      }
    }
    
    // 4. Test login for main admin
    console.log('\n🧪 Testing login for admin@jempol.com...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'password'
    });
    
    if (loginError) {
      console.error('❌ Login test failed:', loginError);
    } else {
      console.log('✅ Login test successful!');
      console.log('User ID:', loginData.user.id);
      console.log('Email:', loginData.user.email);
      
      // Sign out after test
      await supabase.auth.signOut();
    }
    
    console.log('\n🎉 Admin login fix completed!');
    console.log('📝 Summary:');
    console.log('- All admin accounts have been synchronized');
    console.log('- Default password is "password" for all accounts');
    console.log('- Email confirmation is enabled');
    console.log('- You can now login with any admin email and password "password"');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the fix
fixAdminLogin().catch(console.error);