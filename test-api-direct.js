// Test API Connection Direct
const API_BASE_URL = 'http://localhost:5002/api';

async function testAPI() {
    console.log('Testing API connection...');
    console.log('API Base URL:', API_BASE_URL);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check successful:', healthData);
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
        }
        
        // Test tickets endpoint
        console.log('\n2. Testing tickets endpoint...');
        const ticketsResponse = await fetch(`${API_BASE_URL}/complaints/tickets`);
        if (ticketsResponse.ok) {
            const ticketsData = await ticketsResponse.json();
            console.log('✅ Tickets API successful:', ticketsData.length || 0, 'tickets found');
        } else {
            console.log('❌ Tickets API failed:', ticketsResponse.status);
        }
        
        // Test users endpoint
        console.log('\n3. Testing users endpoint...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log('✅ Users API successful:', usersData.length || 0, 'users found');
        } else {
            console.log('❌ Users API failed:', usersResponse.status);
        }
        
        // Test units endpoint
        console.log('\n4. Testing units endpoint...');
        const unitsResponse = await fetch(`${API_BASE_URL}/users/units`);
        if (unitsResponse.ok) {
            const unitsData = await unitsResponse.json();
            console.log('✅ Units API successful:', unitsData.length || 0, 'units found');
        } else {
            console.log('❌ Units API failed:', unitsResponse.status);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run the test
testAPI();