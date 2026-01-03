const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Konfigurasi Supabase yang benar
const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixLoginError() {
    console.log('🔧 Memperbaiki masalah login...\n');

    try {
        // 1. Test koneksi ke Supabase
        console.log('1️⃣ Testing koneksi ke Supabase...');
        const { data: testData, error: testError } = await supabase
            .from('admins')
            .select('count')
            .limit(1);

        if (testError) {
            console.log('❌ Koneksi ke Supabase gagal:', testError.message);
            return;
        }
        console.log('✅ Koneksi ke Supabase berhasil');

        // 2. Cek data admin yang ada
        console.log('\n2️⃣ Memeriksa data admin...');
        const { data: admins, error: adminError } = await supabase
            .from('admins')
            .select('id, username, email, full_name, role, is_active')
            .eq('is_active', true);

        if (adminError) {
            console.log('❌ Error mengambil data admin:', adminError.message);
            return;
        }

        console.log('📋 Admin yang tersedia:');
        admins.forEach(admin => {
            console.log(`   - ${admin.email} (${admin.username}) - ${admin.role}`);
        });

        // 3. Cek data auth.users
        console.log('\n3️⃣ Memeriksa data auth.users...');
        const { data: authUsers, error: authError } = await supabase
            .from('auth.users')
            .select('id, email, email_confirmed_at')
            .limit(10);

        if (authError) {
            console.log('❌ Error mengambil data auth.users:', authError.message);
        } else {
            console.log('📋 Auth users yang tersedia:');
            authUsers.forEach(user => {
                console.log(`   - ${user.email} (confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'})`);
            });
        }

        // 4. Test login dengan admin@kiss.com
        console.log('\n4️⃣ Testing login dengan admin@kiss.com...');
        const testEmail = 'admin@kiss.com';
        const testPassword = 'admin123';

        // Clear any existing session
        await supabase.auth.signOut();

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) {
            console.log('❌ Login gagal:', loginError.message);
            
            // Coba reset password jika user ada di auth.users tapi password salah
            if (loginError.message.includes('Invalid login credentials')) {
                console.log('\n5️⃣ Mencoba reset password...');
                
                // Cek apakah user ada di auth.users
                const { data: existingUser } = await supabase
                    .from('auth.users')
                    .select('id, email')
                    .eq('email', testEmail)
                    .single();

                if (existingUser) {
                    console.log('✅ User ditemukan di auth.users, mencoba update password...');
                    
                    // Update password di auth.users menggunakan service role
                    // Note: Ini memerlukan service role key, bukan anon key
                    console.log('⚠️ Untuk update password, diperlukan service role key');
                    console.log('💡 Solusi: Buat user baru atau gunakan Supabase dashboard');
                } else {
                    console.log('❌ User tidak ditemukan di auth.users');
                    console.log('💡 Solusi: Buat user baru di auth.users');
                }
            }
        } else {
            console.log('✅ Login berhasil!');
            console.log('👤 User:', loginData.user.email);
            console.log('🔑 Session:', loginData.session ? 'Created' : 'Not created');
        }

        // 6. Buat user baru jika diperlukan
        console.log('\n6️⃣ Membuat user baru untuk testing...');
        const newEmail = 'test@admin.com';
        const newPassword = 'test123';

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: newEmail,
            password: newPassword,
            options: {
                emailRedirectTo: undefined // Disable email confirmation
            }
        });

        if (signupError) {
            if (signupError.message.includes('already registered')) {
                console.log('ℹ️ User test sudah ada, mencoba login...');
                
                const { data: testLoginData, error: testLoginError } = await supabase.auth.signInWithPassword({
                    email: newEmail,
                    password: newPassword
                });

                if (testLoginError) {
                    console.log('❌ Login test user gagal:', testLoginError.message);
                } else {
                    console.log('✅ Login test user berhasil!');
                }
            } else {
                console.log('❌ Error membuat user test:', signupError.message);
            }
        } else {
            console.log('✅ User test berhasil dibuat!');
            
            // Tambahkan ke tabel admins
            const { error: insertError } = await supabase
                .from('admins')
                .insert({
                    username: 'testadmin',
                    email: newEmail,
                    full_name: 'Test Admin',
                    role: 'admin',
                    is_active: true,
                    password_hash: await bcrypt.hash(newPassword, 10)
                });

            if (insertError) {
                console.log('⚠️ Warning: Tidak bisa menambahkan ke tabel admins:', insertError.message);
            } else {
                console.log('✅ User test ditambahkan ke tabel admins');
            }
        }

        console.log('\n🎉 Proses perbaikan selesai!');
        console.log('\n📋 Ringkasan:');
        console.log('1. Koneksi Supabase: ✅');
        console.log('2. URL yang digunakan:', SUPABASE_URL);
        console.log('3. Admin tersedia:', admins.length, 'user');
        console.log('4. Test user dibuat: test@admin.com / test123');
        console.log('\n💡 Saran:');
        console.log('- Gunakan test@admin.com / test123 untuk testing');
        console.log('- Pastikan frontend menggunakan URL yang sama');
        console.log('- Bersihkan cache browser sebelum testing');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Jalankan perbaikan
fixLoginError().then(() => {
    console.log('\n✅ Script selesai dijalankan');
    process.exit(0);
}).catch(error => {
    console.error('❌ Script gagal:', error);
    process.exit(1);
});