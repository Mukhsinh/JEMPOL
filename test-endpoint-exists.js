const API_BASE = 'http://localhost:3003';

async function testEndpoints() {
    console.log('Testing if endpoints exist...');
    
    const endpoints = [
        '/api/health',
        '/api/auth/login'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\nTesting ${endpoint}...`);
            
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: endpoint.includes('login') ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: endpoint.includes('login') ? JSON.stringify({}) : undefined
            });

            console.log(`Status: ${response.status}`);
            console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
            
            const text = await response.text();
            console.log(`Body: ${text.substring(0, 200)}`);

        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

testEndpoints();