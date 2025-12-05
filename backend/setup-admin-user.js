import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL dan SUPABASE_ANON_KEY harus diset di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUser() {
  try {
    console.log('🔐 Membuat hash password untuk admin123...');
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('📝 Hash password:', passwordHash);
    
    // Update atau insert admin user
    const { data, error } = await supabase
      .from('admins')
      .upsert({
        username: 'admin',
        password_hash: passwordHash,
        full_name: 'Administrator',
        email: 'admin@jempol.com',
        role: 'superadmin',
        is_active: true
      }, {
        onConflict: 'username'
      })
      .select();
    
    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
    
    console.log('✅ Admin user berhasil dibuat/diupdate!');
    console.log('📋 Data admin:', data);
    console.log('\n🔑 Kredensial Login:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupAdminUser();
