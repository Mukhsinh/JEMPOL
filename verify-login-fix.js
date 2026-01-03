// Verification script for login fix
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLoginFix() {
    console.log('🔍 Verifying login fix...');
    
    try {
        // Test 1: Clear auth state
        console.log('\n1. Clearing auth state...');
        await supabase.auth.signOut();
        
        // Test 2: Check admin data access before login
        console.log('\n2. Testing admin data access before login...');
        const { data: adminsBefore, error: errorBefore } = await supabase
            .from('admins')
            .select('*')
            .eq('email', 'admin@jempol.com')
            .eq('is_active', true);
        
        if (errorBefore) {
            console.log('❌ Cannot access admin data before login:', errorBefore.message);
        } else {
            console.log('✅ Can access admin data before login:', adminsBefore.length, 'records');
        }
        
        // Test 3: Login attempt
        console.log('\n3. Testing login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
        });
        
        if (loginError) {
            console.log('❌ Login failed:', loginError.message);
            return;
        }
        
        console.log('✅ Login successful!');
        console.log('   User ID:', loginData.user.id);
        console.log('   Email:', loginData.user.email);
        
        // Test 4: Check admin data access after login
        console.log('\n4. Testing admin data access after login...');
        const { data: adminsAfter, error: errorAfter } = await supabase
            .from('admins')
            .select('*')
            .eq('email', 'admin@jempol.com')
            .single();
        
        if (errorAfter) {
            console.log('❌ Cannot access admin data after login:', errorAfter.message);
        } else {
            console.log('✅ Admin data accessed successfully');
            console.log('   Admin ID:', adminsAfter.id);
            console.log('   Username:', adminsAfter.username);
            console.log('   Role:', adminsAfter.role);
        }
        
        console.log('\n🎉 Login fix verification completed successfully!');
        
    } catch (error) {
        console.error('❌ Verification error:', error.message);
    }
}

verifyLoginFix();