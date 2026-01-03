const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthFlow() {
    console.log('🔐 Testing complete auth flow...');
    
    try {
        // Step 1: Login
        console.log('Step 1: Login admin...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
        });

        if (loginError) {
            console.error('❌ Login failed:', loginError.message);
            return;
        }

        console.log('✅ Login successful:', loginData.user.email);
        const token = loginData.session.access_token;
        console.log('🎯 Token:', token.substring(0, 50) + '...');

        // Step 2: Test admin profile access
        console.log('\nStep 2: Test admin profile access...');
        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', 'admin@jempol.com')
            .eq('is_active', true)
            .single();

        if (adminError) {
            console.error('❌ Admin profile access failed:', adminError.message);
        } else {
            console.log('✅ Admin profile accessed:', adminData.username);
        }

        // Step 3: Test API endpoints
        console.log('\nStep 3: Test API endpoints...');
        
        const endpoints = [
            '/api/complaints/tickets?limit=5',
            '/api/complaints/units',
            '/api/complaints/categories',
            '/api/complaints/dashboard/metrics/filtered?dateRange=last_7_days&unit_id=all&status=all&category_id=all'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Testing ${endpoint}...`);
                const response = await fetch(`http://localhost:3003${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (response.ok) {
                    console.log(`✅ ${endpoint} - Success`);
                    if (data.data) {
                        console.log(`   Data count: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
                    }
                } else {
                    console.error(`❌ ${endpoint} - Failed:`, data.error);
                }
            } catch (error) {
                console.error(`❌ ${endpoint} - Exception:`, error.message);
            }
        }

        // Step 4: Logout
        console.log('\nStep 4: Logout...');
        const { error: logoutError } = await supabase.auth.signOut();
        if (logoutError) {
            console.error('❌ Logout failed:', logoutError.message);
        } else {
            console.log('✅ Logout successful');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthFlow();