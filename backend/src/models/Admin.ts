import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  full_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

/**
 * Create admin table if not exists
 */
export async function initializeAdminTable() {
  // Check if table exists by trying to select
  const { error } = await supabase.from('admins').select('id').limit(1);
  
  if (error && error.message.includes('does not exist')) {
    console.log('Creating admins table...');
    // Table doesn't exist, create it via SQL
    const { error: createError } = await supabase.rpc('create_admins_table');
    if (createError) {
      console.error('Error creating admins table:', createError);
    }
  }
}

/**
 * Create default admin if none exists
 */
export async function createDefaultAdmin() {
  try {
    // Check if any admin exists
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking admins:', error);
      return;
    }

    if (!admins || admins.length === 0) {
      // Create default admin
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          username: defaultUsername,
          password_hash: passwordHash,
        });

      if (insertError) {
        console.error('Error creating default admin:', insertError);
      } else {
        console.log('Default admin created: username=admin, password=admin123');
      }
    }
  } catch (error) {
    console.error('Error in createDefaultAdmin:', error);
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdmin(username: string, password: string): Promise<Admin | null> {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, password_hash, full_name, email, role, is_active, last_login, created_at, updated_at')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return null;
    }

    // Update last_login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    return admin;
  } catch (error) {
    console.error('Error verifying admin:', error);
    return null;
  }
}
