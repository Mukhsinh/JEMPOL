// Test login directly in browser console
// Copy and paste this in browser console at localhost:3001

async function testLoginDirect() {
    console.log('🔄 Testing login directly...');
    
    try {
        // Clear any existing auth state
        localStorage.clear();
        sessionStorage.clear();
        
        // Import authService (assuming it's available globally)
        const response = await fetch('/src/services/authService.ts');
        
        // Test login with credentials
        const loginResult = await authService.login('admin@jempol.com', 'admin123');
        
        console.log('Login result:', loginResult);
        
        if (loginResult.success) {
            console.log('✅ Login successful!');
            console.log('User data:', loginResult.data);
        } else {
            console.log('❌ Login failed:', loginResult.error);
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Alternative test using direct Supabase client
async function testSupabaseLogin() {
    console.log('🔄 Testing Supabase login...');
    
    const { createClient } = supabase;
    const client = createClient(
        'https://jxxzbdivafzzwqhagwrf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg'
    );
    
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
        });
        
        if (error) {
            console.log('❌ Supabase login error:', error);
            return;
        }
        
        console.log('✅ Supabase login success:', data);
        
        // Test reading admin data
        const { data: adminData, error: adminError } = await client
            .from('admins')
            .select('*')
            .eq('email', 'admin@jempol.com')
            .single();
            
        if (adminError) {
            console.log('❌ Admin data error:', adminError);
        } else {
            console.log('✅ Admin data:', adminData);
        }
        
    } catch (error) {
        console.error('❌ Supabase test error:', error);
    }
}

console.log('Test functions loaded. Run testLoginDirect() or testSupabaseLogin()');