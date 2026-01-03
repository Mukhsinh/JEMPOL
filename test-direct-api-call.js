const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
const API_BASE_URL = 'http://localhost:3003/api/complaints';

async function testAuthFlow() {
    console.log('🔄 Starting auth test...');
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        // Step 1: Login
        console.log('1. Testing login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
        });

        if (loginError) {
            console.error('❌ Login failed:', loginError);
            return;
        }

        console.log('✅ Login successful:', loginData.user.email);
        const token = loginData.session.access_token;
        console.log('🔑 Token:', token.substring(0, 50) + '...');

        // Step 2: Test API call
        console.log('\n2. Testing API call...');
        const response = await fetch(`${API_BASE_URL}/tickets?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('📦 Response data:', JSON.stringify(responseData, null, 2));

        if (response.ok) {
            console.log('✅ API call successful');
        } else {
            console.log('❌ API call failed');
        }

        // Step 3: Test direct Supabase query
        console.log('\n3. Testing direct Supabase query...');
        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', 'admin@jempol.com')
            .eq('is_active', true)
            .single();

        if (adminError) {
            console.error('❌ Direct query failed:', adminError);
        } else {
            console.log('✅ Direct query successful:', adminData.username);
        }

        // Step 4: Logout
        console.log('\n4. Logout...');
        await supabase.auth.signOut();
        console.log('✅ Logout successful');

    } catch (error) {
        console.error('💥 Exception:', error);
    }
}

testAuthFlow();