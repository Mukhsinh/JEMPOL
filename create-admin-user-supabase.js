import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@jempol.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrator',
        role: 'super_admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('User already exists, updating password...');
        
        // Update existing user password
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          'e235a49c-e8bb-4a28-8571-8509a849ee5c', // Use the existing user ID
          {
            password: 'admin123',
            email_confirm: true
          }
        );

        if (updateError) {
          console.error('Error updating user:', updateError);
          return;
        }

        console.log('✅ User password updated successfully');
        console.log('User data:', updateData.user);
      } else {
        console.error('Error creating user:', authError);
        return;
      }
    } else {
      console.log('✅ User created successfully');
      console.log('User data:', authData.user);
    }

    // Ensure admin record exists in admins table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .upsert({
        id: 'e235a49c-e8bb-4a28-8571-8509a849ee5c',
        email: 'admin@jempol.com',
        full_name: 'Administrator',
        username: 'admin',
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (adminError) {
      console.error('Error creating admin record:', adminError);
    } else {
      console.log('✅ Admin record created/updated successfully');
    }

    console.log('\n🎉 Admin user setup complete!');
    console.log('Email: admin@jempol.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();