const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixLogin() {
  console.log('🔧 Memperbaiki login admin...\n');

  try {
    // 1. Cek admin di tabel admins
    console.log('1️⃣ Mengecek admin di database...');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'admin@jempol.com')
      .single();

    if (adminError) {
      console.error('❌ Error mengecek admin:', adminError.message);
      return;
    }

    if (!admins) {
      console.log('❌ Admin tidak ditemukan di tabel admins');
      return;
    }

    console.log('✅ Admin ditemukan:', admins.username);
    console.log('   Email:', admins.email);
    console.log('   Role:', admins.role);
    console.log('   Active:', admins.is_active);

    // 2. Cek apakah user auth sudah ada
    console.log('\n2️⃣ Mengecek user auth...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error list users:', listError.message);
      return;
    }

    const existingUser = users.find(u => u.email === 'admin@jempol.com');
    
    if (existingUser) {
      console.log('✅ User auth sudah ada');
      console.log('   User ID:', existingUser.id);
      
      // Update password
      console.log('\n3️⃣ Mengupdate password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: 'admin123' }
      );

      if (updateError) {
        console.error('❌ Error update password:', updateError.message);
        return;
      }

      console.log('✅ Password berhasil diupdate');
    } else {
      // Buat user auth baru
      console.log('⚠️  User auth belum ada, membuat user baru...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@jempol.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
          username: admins.username,
          full_name: admins.full_name,
          role: admins.role
        }
      });

      if (createError) {
        console.error('❌ Error membuat user:', createError.message);
        return;
      }

      console.log('✅ User auth berhasil dibuat');
      console.log('   User ID:', newUser.user.id);
    }

    // 4. Test login
    console.log('\n4️⃣ Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@jempol.com',
      password: 'admin123'
    });

    if (loginError) {
      console.error('❌ Login gagal:', loginError.message);
      return;
    }

    console.log('✅ Login berhasil!');
    console.log('   Access Token:', loginData.session.access_token.substring(0, 50) + '...');

    console.log('\n✅ PERBAIKAN SELESAI!');
    console.log('\n📝 Kredensial Login:');
    console.log('   Email: admin@jempol.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Silakan login di: http://localhost:3005/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixLogin();
