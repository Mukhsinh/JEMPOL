// Test script with authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api';

async function testWithAuth() {
    console.log('🧪 Testing Tickets API with Authentication...\n');

    try {
        // Step 1: Login to get token
        console.log('1. Attempting to login...');
        
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };

        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
        
        if (loginResponse.data.success && loginResponse.data.token) {
            console.log('✅ Login successful');
            const token = loginResponse.data.token;
            
            // Step 2: Test tickets endpoint with authentication
            console.log('2. Testing tickets endpoint with authentication...');
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            
            const ticketsResponse = await axios.get(`${BASE_URL}/complaints/tickets`, config);
            console.log('✅ Tickets API Response:', JSON.stringify(ticketsResponse.data, null, 2));
            
            // Step 3: Test specific ticket if any exist
            if (ticketsResponse.data.data && ticketsResponse.data.data.length > 0) {
                console.log('3. Testing single ticket endpoint...');
                const firstTicketId = ticketsResponse.data.data[0].id;
                
                const singleTicketResponse = await axios.get(`${BASE_URL}/complaints/tickets/${firstTicketId}`, config);
                console.log('✅ Single Ticket Response:', JSON.stringify(singleTicketResponse.data, null, 2));
            } else {
                console.log('3. No tickets found to test single ticket endpoint');
            }
            
            // Step 4: Test dashboard metrics
            console.log('4. Testing dashboard metrics...');
            const metricsResponse = await axios.get(`${BASE_URL}/complaints/dashboard/metrics`, config);
            console.log('✅ Dashboard Metrics:', JSON.stringify(metricsResponse.data, null, 2));
            
        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.data && error.response.data.error && 
                error.response.data.error.includes('infinite recursion')) {
                console.log('💡 Infinite recursion issue still exists!');
            }
        }
    }
}

// Run the test
testWithAuth();