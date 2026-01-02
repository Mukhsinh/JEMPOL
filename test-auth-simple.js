// Simple Node.js script to test authentication flow
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
    console.log('=== Testing Authentication Flow ===');
    
    try {
        // 1. Login
        console.log('1. Attempting login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'admin123'
        });
        
        if (loginError) {
            console.error('Login failed:', loginError.message);
            return;
        }
        
        console.log('✓ Login successful');
        console.log('User:', loginData.user.email);
        console.log('Token (first 50 chars):', loginData.session.access_token.substring(0, 50) + '...');
        
        // 2. Test API call
        console.log('\n2. Testing API call...');
        const response = await fetch('http://localhost:5001/api/complaints/tickets', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.session.access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✓ API call successful');
            console.log('Tickets count:', data.data ? data.data.length : 0);
        } else {
            console.error('✗ API call failed');
        }
        
        // 3. Logout
        console.log('\n3. Logging out...');
        await supabase.auth.signOut();
        console.log('✓ Logout successful');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

testAuthFlow();