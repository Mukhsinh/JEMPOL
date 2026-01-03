// Simple test script to test tickets API
const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api';

// Test function
async function testTicketsAPI() {
    console.log('🧪 Testing Tickets API...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);
        console.log('');

        // Test 2: Test public tickets endpoint (no auth required)
        console.log('2. Testing public tickets endpoint...');
        const publicTicketsResponse = await axios.get(`${BASE_URL}/complaints/public/tickets`);
        console.log('✅ Public tickets:', publicTicketsResponse.data);
        console.log('');

        // Test 3: Test public units endpoint
        console.log('3. Testing public units endpoint...');
        const publicUnitsResponse = await axios.get(`${BASE_URL}/complaints/public/units`);
        console.log('✅ Public units:', publicUnitsResponse.data);
        console.log('');

        // Test 4: Test authenticated tickets endpoint (this was causing infinite recursion)
        console.log('4. Testing authenticated tickets endpoint...');
        console.log('⚠️  This requires authentication token, will likely fail but should not cause infinite recursion');
        
        try {
            const ticketsResponse = await axios.get(`${BASE_URL}/complaints/tickets`);
            console.log('✅ Authenticated tickets:', ticketsResponse.data);
        } catch (authError) {
            if (authError.response && authError.response.status === 401) {
                console.log('✅ Got 401 Unauthorized (expected without token)');
            } else if (authError.message.includes('infinite recursion')) {
                console.log('❌ Still getting infinite recursion error!');
            } else {
                console.log('✅ Got different error (not infinite recursion):', authError.message);
            }
        }
        console.log('');

        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Backend server is not running. Please start it with: npm start');
        } else if (error.message.includes('infinite recursion')) {
            console.log('💡 Infinite recursion issue still exists in database policies');
        }
    }
}

// Run the test
testTicketsAPI();