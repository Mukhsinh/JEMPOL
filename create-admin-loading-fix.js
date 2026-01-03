// Script untuk membuat admin user jika tabel kosong
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminUser() {
    console.log('🔧 Membuat admin user untuk fix loading issue...');

    try {
        // 1. Cek apakah tabel admins ada dan kosong
        console.log('📊 Checking tabel admins...');
        const { data: existingAdmins, error: checkError } = await supabase
            .from('admins')
            .select('id')
            .limit(1);

        if (checkError) {
            console.error('❌ Error checking admins table:', checkError.message);
            if (checkError.message.includes('relation') && checkError.message.includes('does not exist')) {
                console.log('💡 Tabel admins tidak ada. Silakan buat tabel di Supabase dashboard terlebih dahulu.');
                return;
            }
            throw checkError;
        }

        if (existingAdmins && existingAdmins.length > 0) {
            console.log('ℹ️ Admin user sudah ada, tidak perlu membuat baru');
            return;
        }

        console.log('📝 Tabel admins kosong, membuat admin user...');

        // 2. Data admin default
        const adminData = {
            username: 'admin',
            email: 'admin@jempol.com',
            password: 'admin123',
            full_name: 'Administrator',
            role: 'superadmin'
        };

        // 3. Hash password
        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // 4. Buat auth user di Supabase Auth
        console.log('👤 Creating auth user...');
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: adminData.email,
            password: adminData.password,
            email_confirm: true,
            user_metadata: {
                username: adminData.username,
                full_name: adminData.full_name,
                role: adminData.role
            }
        });

        if (authError) {
            console.error('❌ Error creating auth user:', authError.message);
            // Jika user sudah ada, lanjutkan
            if (!authError.message.includes('already registered')) {
                throw authError;
            }
            console.log('ℹ️ Auth user sudah ada, melanjutkan...');
        } else {
            console.log('✅ Auth user created:', authUser.user.email);
        }

        // 5. Insert ke tabel admins
        console.log('📝 Inserting admin record...');
        const { data: adminRecord, error: insertError } = await supabase
            .from('admins')
            .insert([{
                username: adminData.username,
                email: adminData.email,
                password_hash: hashedPassword,
                full_name: adminData.full_name,
                role: adminData.role,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error inserting admin record:', insertError.message);
            throw insertError;
        }

        console.log('✅ Admin user berhasil dibuat!');
        console.log('📋 Detail admin:');
        console.log(`   Username: ${adminData.username}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   Role: ${adminData.role}`);
        console.log('');
        console.log('🚀 Sekarang coba login dengan kredensial di atas');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.log('');
        console.log('💡 Troubleshooting:');
        console.log('1. Pastikan tabel "admins" sudah dibuat di Supabase');
        console.log('2. Pastikan RLS policies mengizinkan insert');
        console.log('3. Periksa koneksi internet');
    }
}

// Jalankan script
createAdminUser().then(() => {
    console.log('🏁 Script selesai');
    process.exit(0);
}).catch(error => {
    console.error('💥 Script error:', error);
    process.exit(1);
});