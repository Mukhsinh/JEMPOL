import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminTable() {
  try {
    console.log('Creating admins table...');
    
    // Note: This requires RLS to be disabled or proper permissions
    // You may need to run this SQL directly in Supabase dashboard:
    console.log('\n⚠️  Please run this SQL in your Supabase SQL Editor:\n');
    console.log(`
-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on admins" ON admins
  FOR ALL
  USING (true)
  WITH CHECK (true);
    `);

    // Try to check if table exists
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('\n❌ Table does not exist. Please create it using the SQL above.');
      return;
    }

    if (error) {
      console.error('Error checking table:', error);
      return;
    }

    console.log('\n✅ Table exists!');

    // Check if default admin exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('username')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return;
    }

    // Create default admin
    console.log('Creating default admin...');
    const passwordHash = await bcrypt.hash('admin123', 10);

    const { error: insertError } = await supabase
      .from('admins')
      .insert({
        username: 'admin',
        password_hash: passwordHash,
      });

    if (insertError) {
      console.error('Error creating admin:', insertError);
      return;
    }

    console.log('\n✅ Default admin created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminTable();
