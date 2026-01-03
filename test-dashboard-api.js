const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
const API_BASE_URL = 'http://localhost:3003/api/complaints';

async function testDashboardAPIs() {
    console.log('🔄 Testing Dashboard APIs...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
        // Login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
        });

        if (loginError) {
            console.error('❌ Login failed:', loginError);
            return;
        }

        const token = loginData.session.access_token;
        console.log('✅ Login successful');

        // Test endpoints that were failing
        const endpoints = [
            '/tickets?limit=10',
            '/dashboard/metrics/filtered?dateRange=last_7_days&unit_id=all&status=all&category_id=all',
            '/units',
            '/categories'
        ];

        for (const endpoint of endpoints) {
            console.log(`\n🧪 Testing: ${endpoint}`);
            
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    console.log(`✅ ${endpoint}: Success`);
                    console.log(`   Data count: ${data.data?.length || 'N/A'}`);
                    if (endpoint.includes('dashboard')) {
                        console.log(`   Status counts:`, data.data?.statusCounts || {});
                    }
                } else {
                    console.log(`❌ ${endpoint}: Failed (${response.status})`);
                    console.log(`   Error:`, data.error);
                }
            } catch (error) {
                console.log(`💥 ${endpoint}: Exception - ${error.message}`);
            }
        }

        // Logout
        await supabase.auth.signOut();
        console.log('\n✅ Test completed');

    } catch (error) {
        console.error('💥 Exception:', error);
    }
}

testDashboardAPIs();