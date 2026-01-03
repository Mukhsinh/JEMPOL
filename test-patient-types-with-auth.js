// Test script untuk menguji endpoint patient-types dengan autentikasi
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
const API_BASE_URL = 'http://localhost:3003/api';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithAuth() {
    console.log('🔐 Testing Patient Types with Authentication...\n');
    
    // Step 1: Login to get valid token
    console.log('1. Logging in to get valid token...');
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@example.com',
            password: 'admin123'
        });
        
        if (error) {
            console.log('❌ Login failed:', error.message);
            return;
        }
        
        if (!data.session) {
            console.log('❌ No session returned');
            return;
        }
        
        console.log('✅ Login successful');
        console.log('Token:', data.session.access_token.substring(0, 50) + '...');
        
        // Step 2: Test authenticated endpoint
        console.log('\n2. Testing authenticated endpoint...');
        const response = await fetch(`${API_BASE_URL}/master-data/patient-types`, {
            headers: {
                'Authorization': `Bearer ${data.session.access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const responseText = await response.text();
        let responseData;
        
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(responseData, null, 2));
        
        if (response.ok) {
            console.log('✅ Authenticated endpoint works!');
            console.log('Records returned:', Array.isArray(responseData) ? responseData.length : 'Not an array');
        } else {
            console.log('❌ Authenticated endpoint failed');
            console.log('Error details:', responseData);
        }
        
        // Step 3: Test direct Supabase query
        console.log('\n3. Testing direct Supabase query...');
        const { data: directData, error: directError } = await supabase
            .from('patient_types')
            .select('*')
            .eq('is_active', true);
        
        if (directError) {
            console.log('❌ Direct Supabase query failed:', directError.message);
        } else {
            console.log('✅ Direct Supabase query works');
            console.log('Records:', directData.length);
            console.log('Sample record:', directData[0]);
        }
        
        // Step 4: Logout
        await supabase.auth.signOut();
        console.log('\n4. Logged out');
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
}

// Run the test
testWithAuth().catch(console.error);