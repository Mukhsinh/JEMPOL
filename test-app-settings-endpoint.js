// Test App Settings Endpoint
const API_BASE = 'http://localhost:5000/api';

async function testAppSettingsEndpoint() {
    console.log('🧪 Testing App Settings Endpoint...');
    
    // Get token from localStorage or environment
    const token = process.env.AUTH_TOKEN || 'your-test-token-here';
    
    if (!token || token === 'your-test-token-here') {
        console.error('❌ Please set AUTH_TOKEN environment variable or update the token in this script');
        return;
    }

    try {
        console.log('📡 Testing GET /api/app-settings...');
        
        const response = await fetch(`${API_BASE}/app-settings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ GET request successful!');
            console.log(`📋 Found ${data.length} settings:`);
            
            data.forEach(setting => {
                console.log(`  - ${setting.setting_key}: "${setting.setting_value}" (${setting.setting_type})`);
            });

            // Test POST/PUT request
            console.log('\n📡 Testing POST /api/app-settings...');
            
            const testData = {
                app_name: 'Test App Settings Integration',
                institution_name: 'Test Institution',
                description: 'Test description for endpoint validation'
            };

            const postResponse = await fetch(`${API_BASE}/app-settings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            console.log(`📊 POST Response Status: ${postResponse.status} ${postResponse.statusText}`);
            
            if (postResponse.ok) {
                const postResult = await postResponse.json();
                console.log('✅ POST request successful!');
                console.log('📝 Response:', postResult);
                
                // Verify the data was saved
                console.log('\n🔍 Verifying saved data...');
                const verifyResponse = await fetch(`${API_BASE}/app-settings`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    const savedSettings = {};
                    verifyData.forEach(s => {
                        savedSettings[s.setting_key] = s.setting_value;
                    });

                    console.log('📋 Current settings after save:');
                    Object.keys(testData).forEach(key => {
                        const saved = savedSettings[key];
                        const expected = testData[key];
                        const match = saved === expected;
                        console.log(`  - ${key}: "${saved}" ${match ? '✅' : '❌'} (expected: "${expected}")`);
                    });
                }
            } else {
                const errorData = await postResponse.text();
                console.error('❌ POST request failed:', errorData);
            }

        } else {
            const errorData = await response.text();
            console.error('❌ GET request failed:', errorData);
        }

    } catch (error) {
        console.error('💥 Test failed with error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testAppSettingsEndpoint();
} else {
    // Browser environment
    console.log('🌐 Running in browser - call testAppSettingsEndpoint() manually');
    window.testAppSettingsEndpoint = testAppSettingsEndpoint;
}