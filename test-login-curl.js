const https = require('https');
const http = require('http');

async function testLogin() {
    console.log('🔐 Testing Login with cURL equivalent...\n');

    const loginData = {
        username: 'admin_jempol',
        password: 'admin123'
    };

    const postData = JSON.stringify(loginData);

    const options = {
        hostname: 'localhost',
        port: 3003,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Accept': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        console.log('📡 Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
        console.log('📦 Payload:', postData);
        console.log('');

        const req = http.request(options, (res) => {
            console.log(`📊 Status Code: ${res.statusCode}`);
            console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
            console.log('');

            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('📥 Response Body:');
                try {
                    const jsonData = JSON.parse(data);
                    console.log(JSON.stringify(jsonData, null, 2));
                    
                    if (res.statusCode === 200) {
                        console.log('\n✅ Login berhasil!');
                        console.log(`Token: ${jsonData.token ? 'Generated' : 'Missing'}`);
                        console.log(`User: ${jsonData.user?.username || 'Unknown'}`);
                        console.log(`Role: ${jsonData.user?.role || 'Unknown'}`);
                    } else {
                        console.log('\n❌ Login gagal!');
                        console.log(`Error: ${jsonData.message || 'Unknown error'}`);
                    }
                } catch (e) {
                    console.log('Raw response:', data);
                    console.log('Parse error:', e.message);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.error('❌ Request error:', err.message);
            console.log('\n💡 Pastikan backend server berjalan di port 3003');
            reject(err);
        });

        req.on('timeout', () => {
            console.error('❌ Request timeout');
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.setTimeout(10000); // 10 second timeout
        req.write(postData);
        req.end();
    });
}

// Test dengan berbagai kredensial
async function testMultipleCredentials() {
    const credentials = [
        { username: 'admin_jempol', password: 'admin123' },
        { username: 'admin', password: 'admin123' }
    ];

    for (const cred of credentials) {
        console.log(`\n🔄 Testing: ${cred.username} / ${cred.password}`);
        console.log('='.repeat(50));
        
        try {
            await testLogin();
        } catch (error) {
            console.error('Test failed:', error.message);
        }
        
        console.log('\n');
    }
}

// Run tests
testMultipleCredentials().then(() => {
    console.log('🏁 All tests completed!');
}).catch(error => {
    console.error('❌ Test suite failed:', error);
});