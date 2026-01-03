const { createClient } = require('@supabase/supabase-js');

// Konfigurasi Supabase yang benar
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user in correct database...');
        
        // Coba signup user baru
        const { data, error } = await supabase.auth.signUp({
            email: 'admin@jempol.com',
            password: 'admin123',
            options: {
                data: {
                    role: 'admin',
                    full_name: 'Administrator'
                }
            }
        });
        
        if (error) {
            console.error('❌ Error creating user:', error.message);
            
            // Jika user sudah ada, coba login untuk test
            console.log('🔄 User might already exist, testing login...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: 'admin@jempol.com',
                password: 'admin123'
            });
            
            if (loginError) {
                console.error('❌ Login test failed:', loginError.message);
            } else {
                console.log('✅ Login test successful!');
                console.log('👤 User:', loginData.user.email);
            }
        } else {
            console.log('✅ User created successfully');
            console.log('👤 User:', data.user.email);
            console.log('📧 Confirmation email sent:', data.user.email_confirmed_at ? 'Already confirmed' : 'Pending confirmation');
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

createAdminUser();