// Test API Endpoints Direct
const API_BASE = 'http://localhost:3003/api';

async function testEndpoint(url, title) {
    console.log(`\n🔍 Testing: ${title}`);
    console.log(`URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log('❌ Error');
            console.log('Error:', errorText);
        }
    } catch (error) {
        console.log('❌ Connection Error');
        console.log('Error:', error.message);
    }
    
    console.log('─'.repeat(50));
}

async function runTests() {
    console.log('🚀 Starting API Endpoint Tests...');
    console.log('='.repeat(50));
    
    // Test basic endpoints
    await testEndpoint(`${API_BASE}/health`, 'Health Check');
    await testEndpoint(`${API_BASE}/public/units`, 'Public Units');
    await testEndpoint(`${API_BASE}/public/unit-types`, 'Public Unit Types');
    
    // Test master data
    await testEndpoint(`${API_BASE}/master-data/units`, 'Master Data Units');
    await testEndpoint(`${API_BASE}/master-data/unit-types`, 'Master Data Unit Types');
    await testEndpoint(`${API_BASE}/master-data/service-categories`, 'Service Categories');
    
    // Test other endpoints
    await testEndpoint(`${API_BASE}/complaints`, 'Complaints');
    await testEndpoint(`${API_BASE}/escalation`, 'Escalation');
    await testEndpoint(`${API_BASE}/roles`, 'Roles');
    
    console.log('\n🏁 Tests completed!');
}

// Run tests if this is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runTests();
} else {
    // Browser environment
    window.runAPITests = runTests;
    console.log('API test functions loaded. Call runAPITests() to start.');
}