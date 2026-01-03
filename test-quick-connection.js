const http = require('http');

// Test Backend Connection
function testBackend() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3003/api/health', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('✅ Backend Status:', res.statusCode);
                console.log('✅ Backend Response:', data);
                resolve(true);
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ Backend Error:', err.message);
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Backend Timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Test Frontend Connection
function testFrontend() {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3001/', (res) => {
            console.log('✅ Frontend Status:', res.statusCode);
            resolve(true);
        });
        
        req.on('error', (err) => {
            console.log('❌ Frontend Error:', err.message);
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Frontend Timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function runTests() {
    console.log('🔍 Testing Connections...\n');
    
    try {
        await testBackend();
    } catch (err) {
        console.log('Backend test failed');
    }
    
    try {
        await testFrontend();
    } catch (err) {
        console.log('Frontend test failed');
    }
    
    console.log('\n✅ Connection tests completed!');
}

runTests();