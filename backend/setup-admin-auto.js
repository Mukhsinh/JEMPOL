import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('\nPlease set in .env:');
  console.log('SUPABASE_URL=your_url');
  console.log('SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  console.log('🔧 Setting up admin table and user...\n');

  try {
    // Try to check if table exists
    console.log('1. Checking if admins table exists...');
    const { data: existingData, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (checkError) {
      if (checkError.message.includes('does not exist')) {
        console.log('❌ Table does not exist\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  PLEASE CREATE TABLE MANUALLY IN SUPABASE');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('1. Open: https://supabase.com/dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Run this SQL:\n');
        console.log('-- Create admins table');
        console.log('CREATE TABLE IF NOT EXISTS admins (');
        console.log('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
        console.log('  username VARCHAR(255) UNIQUE NOT NULL,');
        console.log('  password_hash VARCHAR(255) NOT NULL,');
        console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
        console.log(');\n');
        console.log('CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);');
        console.log('ALTER TABLE admins ENABLE ROW LEVEL SECURITY;');
        console.log('CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true) WITH CHECK (true);\n');
        console.log('4. Then run this script again\n');
        console.log('═══════════════════════════════════════════════════════\n');
        return;
      }
      throw checkError;
    }

    console.log('✅ Table exists\n');

    // Check if admin user exists
    console.log('2. Checking if admin user exists...');
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('username')
      .eq('username', 'admin')
      .single();

    if (adminData) {
      console.log('✅ Admin user already exists\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  LOGIN CREDENTIALS');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  URL: http://localhost:3001/login');
      console.log('═══════════════════════════════════════════════════════\n');
      return;
    }

    // Create admin user
    console.log('⚙️  Creating admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);

    const { error: insertError } = await supabase
      .from('admins')
      .insert({
        username: 'admin',
        password_hash: passwordHash,
      });

    if (insertError) {
      console.error('❌ Error creating admin:', insertError);
      return;
    }

    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  URL: http://localhost:3001/login');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Change password after first login!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPlease create the table manually in Supabase Dashboard.');
  }
}

setupAdmin();
