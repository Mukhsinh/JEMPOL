// Test script untuk menguji endpoint patient-types secara langsung
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3003/api';

async function testPatientTypesEndpoints() {
    console.log('🔍 Testing Patient Types Endpoints...\n');
    
    // Test 1: Public endpoint
    console.log('1. Testing public endpoint: /api/master-data/public/patient-types');
    try {
        const response = await fetch(`${API_BASE_URL}/master-data/public/patient-types`);
        const data = await response.text();
        
        console.log('Status:', response.status);
        console.log('Response:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
        
        if (response.ok) {
            console.log('✅ Public endpoint works');
        } else {
            console.log('❌ Public endpoint failed');
        }
    } catch (error) {
        console.log('❌ Public endpoint error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Authenticated endpoint without token
    console.log('2. Testing auth endpoint without token: /api/master-data/patient-types');
    try {
        const response = await fetch(`${API_BASE_URL}/master-data/patient-types`);
        const data = await response.text();
        
        console.log('Status:', response.status);
        console.log('Response:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
        
        if (response.status === 401) {
            console.log('✅ Auth endpoint correctly requires token');
        } else {
            console.log('❌ Auth endpoint should require token');
        }
    } catch (error) {
        console.log('❌ Auth endpoint error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Authenticated endpoint with dummy token
    console.log('3. Testing auth endpoint with dummy token');
    try {
        const response = await fetch(`${API_BASE_URL}/master-data/patient-types`, {
            headers: {
                'Authorization': 'Bearer dummy-token',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.text();
        
        console.log('Status:', response.status);
        console.log('Response:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
        
        if (response.status === 403 || response.status === 401) {
            console.log('✅ Auth endpoint correctly rejects invalid token');
        } else {
            console.log('❌ Auth endpoint should reject invalid token');
        }
    } catch (error) {
        console.log('❌ Auth endpoint error:', error.message);
    }
    
    console.log('\n📝 Summary:');
    console.log('- Public endpoint should work without authentication');
    console.log('- Auth endpoint should require valid token');
    console.log('- Check backend logs for detailed error messages');
    console.log('- Make sure backend server is running on port 3003');
}

// Run the test
testPatientTypesEndpoints().catch(console.error);