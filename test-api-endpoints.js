const http = require('http');

function testEndpoint(url, name) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ ${name}: Status ${res.statusCode}`);
                if (res.statusCode === 200) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`   Response: ${JSON.stringify(parsed).substring(0, 100)}...`);
                    } catch (e) {
                        console.log(`   Response: ${data.substring(0, 100)}...`);
                    }
                }
                resolve(true);
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ ${name}: ${err.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log(`❌ ${name}: Timeout`);
            req.destroy();
            resolve(false);
        });
    });
}

async function testAllEndpoints() {
    console.log('🔍 Testing API Endpoints...\n');
    
    const endpoints = [
        ['http://localhost:3003/api/health', 'Health Check'],
        ['http://localhost:3003/api/public/units', 'Public Units'],
        ['http://localhost:3003/api/test/units', 'Test Units'],
        ['http://localhost:3003/api/master-data/unit-types', 'Unit Types'],
        ['http://localhost:3003/api/master-data/service-categories', 'Service Categories'],
        ['http://localhost:3003/api/complaints/tickets?limit=1', 'Tickets (may need auth)'],
    ];
    
    for (const [url, name] of endpoints) {
        await testEndpoint(url, name);
        console.log(''); // Empty line for readability
    }
    
    console.log('✅ API endpoint tests completed!');
}

testAllEndpoints();