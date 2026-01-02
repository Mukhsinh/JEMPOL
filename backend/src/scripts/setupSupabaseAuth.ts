import supabase from '../config/supabase.js';

/**
 * Setup Supabase Auth users for existing admins
 */
async function setupSupabaseAuth() {
  try {
    console.log('🔧 Setting up Supabase Auth for existing admins...');

    // Get all active admins
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching admins:', error);
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('No active admins found');
      return;
    }

    console.log(`Found ${admins.length} active admins`);

    for (const admin of admins) {
      if (!admin.email) {
        console.log(`⚠️  Skipping admin ${admin.username} - no email`);
        continue;
      }

      console.log(`Creating auth user for: ${admin.email}`);

      // Create auth user with default password
      const defaultPassword = 'admin123'; // You should change this
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: defaultPassword,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name: admin.full_name,
          username: admin.username,
          role: admin.role,
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`✅ Auth user already exists for: ${admin.email}`);
        } else {
          console.error(`❌ Error creating auth user for ${admin.email}:`, authError);
        }
      } else {
        console.log(`✅ Created auth user for: ${admin.email}`);
        console.log(`   Default password: ${defaultPassword}`);
        console.log(`   Please ask user to change password after first login`);
      }
    }

    console.log('🎉 Supabase Auth setup completed!');
    console.log('\n📋 Summary:');
    console.log('- All active admins now have Supabase Auth accounts');
    console.log('- Default password: admin123');
    console.log('- Users should change their password after first login');
    console.log('- Login now uses email instead of username');

  } catch (error) {
    console.error('Error in setupSupabaseAuth:', error);
  }
}

// Run the setup
setupSupabaseAuth();