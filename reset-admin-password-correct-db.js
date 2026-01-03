const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Konfigurasi Supabase yang benar
const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdminPassword() {
    try {
        console.log('🔧 Resetting admin password in correct database...');
        
        // Hash password baru
        const newPassword = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        console.log('🔐 New hashed password:', hashedPassword);
        
        // Update password di auth.users
        const { data, error } = await supabase
            .from('auth.users')
            .update({ 
                encrypted_password: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('email', 'admin@jempol.com');
            
        if (error) {
            console.error('❌ Error updating password:', error);
        } else {
            console.log('✅ Password updated successfully');
        }
        
        // Verifikasi user exists
        const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('email, encrypted_password, created_at')
            .eq('email', 'admin@jempol.com');
            
        if (userError) {
            console.error('❌ Error fetching user:', userError);
        } else {
            console.log('👤 User data:', userData);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

resetAdminPassword();